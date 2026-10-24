import "server-only";

import { cacheLife } from "next/cache";

/** Same identity as Nominatim lookups — Nominatim usage policy. */
export const OSM_USER_AGENT =
  "DirtyDecember/1.0 (https://www.dirtydecember.info; hello@dirtydecember.info)";

/** Public mirrors; try the next on 429/5xx or timeout. Self-host: set OVERPASS_URL. */
const OVERPASS_ENDPOINTS = process.env.OVERPASS_URL?.trim()
  ? [process.env.OVERPASS_URL.trim()]
  : ([
      "https://overpass-api.de/api/interpreter",
      "https://lz4.overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ] as const);

const MIN_GAP_MS = 1500;
const FETCH_TIMEOUT_MS = 40_000;

export type OverpassBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type OverpassPoi = {
  id: string;
  latitude: number;
  longitude: number;
  tags: Record<string, string>;
  osmUrl: string;
};

let lastOverpassAt = 0;
let overpassChain: Promise<void> = Promise.resolve();

function waitForOverpassSlot() {
  const run = overpassChain.then(async () => {
    const now = Date.now();
    const wait = Math.max(0, lastOverpassAt + MIN_GAP_MS - now);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastOverpassAt = Date.now();
  });
  overpassChain = run.catch(() => undefined);
  return run;
}

function bboxClause(bounds: OverpassBounds) {
  return `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
}

function buildQuery(bounds: OverpassBounds, tagFilters: string[], limit: number) {
  const box = bboxClause(bounds);
  // nwr covers node/way/relation in one clause — lighter than separate node+way pairs.
  const parts = tagFilters.map((filter) => `nwr${filter}(${box});`);
  return `[out:json][timeout:35];(${parts.join("")});out center tags ${limit};`;
}

function readTags(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string" && raw.trim()) out[key] = raw.trim();
  }
  return out;
}

function parseCoordinate(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function osmObjectUrl(type: string, id: number | string) {
  const kind =
    type === "node" || type === "way" || type === "relation" ? type : "node";
  return `https://www.openstreetmap.org/${kind}/${id}`;
}

function readElements(payload: unknown, limit: number): OverpassPoi[] {
  if (!payload || typeof payload !== "object") return [];
  const elements = (payload as { elements?: unknown }).elements;
  if (!Array.isArray(elements)) return [];
  const rows: OverpassPoi[] = [];
  for (const item of elements) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const type = typeof row.type === "string" ? row.type : "";
    const idRaw = row.id;
    if (typeof idRaw !== "number" && typeof idRaw !== "string") continue;
    const tags = readTags(row.tags);
    if (!tags.name && !tags["name:en"]) continue;

    let latitude = parseCoordinate(row.lat);
    let longitude = parseCoordinate(row.lon);
    if (latitude === null || longitude === null) {
      const center = row.center;
      if (center && typeof center === "object") {
        const c = center as Record<string, unknown>;
        latitude = parseCoordinate(c.lat);
        longitude = parseCoordinate(c.lon);
      }
    }
    if (latitude === null || longitude === null) continue;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) continue;

    rows.push({
      id: `${type}/${idRaw}`,
      latitude,
      longitude,
      tags,
      osmUrl: osmObjectUrl(type, idRaw),
    });
    if (rows.length >= limit) break;
  }
  return rows;
}

async function postOverpass(endpoint: string, query: string): Promise<Response> {
  return fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": OSM_USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
}

async function fetchOverpassQuery(query: string, limit: number): Promise<OverpassPoi[]> {
  await waitForOverpassSlot();
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await postOverpass(endpoint, query);
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`overpass ${response.status}`);
        continue;
      }
      if (!response.ok) throw new Error(`overpass ${response.status}`);
      return readElements(await response.json(), limit);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("overpass failed");
}

/** ~30 minute server cache keyed by the Overpass query string. */
async function cachedOverpassQuery(query: string, limit: number): Promise<OverpassPoi[]> {
  "use cache";
  cacheLife({ stale: 1800, revalidate: 1800, expire: 1800 });
  return fetchOverpassQuery(query, limit);
}

export async function queryOverpassPois(
  bounds: OverpassBounds,
  tagFilters: string[],
  limit: number,
): Promise<OverpassPoi[]> {
  const query = buildQuery(bounds, tagFilters, limit);
  return cachedOverpassQuery(query, limit);
}
