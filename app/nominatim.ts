import "server-only";

import { cacheLife } from "next/cache";
import { OSM_USER_AGENT } from "./overpass";
import {
  intakeCityCountry,
  isIntakeCity,
  type GeocodeCandidate,
  type IntakeCity,
} from "./place-intake";

export type { GeocodeCandidate };

/** Self-host: set NOMINATIM_URL to the origin only (code appends /search). */
const NOMINATIM_ORIGIN =
  process.env.NOMINATIM_URL?.trim().replace(/\/$/, "") ||
  "https://nominatim.openstreetmap.org";
const NOMINATIM_SEARCH = `${NOMINATIM_ORIGIN}/search`;
const MIN_GAP_MS = 1100;
const MAX_RESULTS = 5;

let lastNominatimAt = 0;
let nominatimChain: Promise<void> = Promise.resolve();

function waitForNominatimSlot() {
  const run = nominatimChain.then(async () => {
    const now = Date.now();
    const wait = Math.max(0, lastNominatimAt + MIN_GAP_MS - now);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastNominatimAt = Date.now();
  });
  nominatimChain = run.catch(() => undefined);
  return run;
}

function parseCoordinate(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  return number;
}

function readCandidates(payload: unknown): GeocodeCandidate[] {
  if (!Array.isArray(payload)) return [];
  const rows: GeocodeCandidate[] = [];
  for (const item of payload) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const latitude = parseCoordinate(row.lat);
    const longitude = parseCoordinate(row.lon);
    if (latitude === null || longitude === null) continue;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) continue;
    const displayName = typeof row.display_name === "string" ? row.display_name.trim() : "";
    if (!displayName) continue;
    const named =
      row.name && typeof row.name === "string" && row.name.trim()
        ? row.name.trim()
        : displayName.split(",")[0]?.trim() || displayName;
    const placeId = row.place_id;
    const osmType = typeof row.osm_type === "string" ? row.osm_type : "";
    const osmIdRaw = row.osm_id;
    const osmId =
      osmType && (typeof osmIdRaw === "number" || typeof osmIdRaw === "string")
        ? `${osmType}/${osmIdRaw}`
        : typeof placeId === "number" || typeof placeId === "string"
          ? `place/${placeId}`
          : `${named}:${latitude}:${longitude}`;
    rows.push({
      osmId,
      name: named,
      displayName,
      latitude,
      longitude,
    });
    if (rows.length >= MAX_RESULTS) break;
  }
  return rows;
}

async function fetchNominatim(name: string, city: IntakeCity): Promise<GeocodeCandidate[]> {
  await waitForNominatimSlot();
  const query = `${name}, ${city}, ${intakeCityCountry(city)}`;
  const url = new URL(NOMINATIM_SEARCH);
  url.searchParams.set("format", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(MAX_RESULTS));
  url.searchParams.set("addressdetails", "0");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": OSM_USER_AGENT,
    },
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
  });
  if (!response.ok) return [];
  return readCandidates(await response.json());
}

async function cachedNominatimSearch(name: string, city: IntakeCity): Promise<GeocodeCandidate[]> {
  "use cache";
  cacheLife({ stale: 86_400, revalidate: 86_400, expire: 604_800 });
  return fetchNominatim(name, city);
}

export async function lookupPlaceOnMap(
  name: string,
  city: string,
): Promise<{ status: "ok"; candidates: GeocodeCandidate[] } | { status: "error"; message: string }> {
  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 200) {
    return { status: "error", message: "Enter a place or business name to look up." };
  }
  if (!isIntakeCity(city)) {
    return { status: "error", message: "Choose Lagos, Accra, or Calabar." };
  }
  try {
    const candidates = await cachedNominatimSearch(trimmedName, city);
    return { status: "ok", candidates };
  } catch {
    return {
      status: "error",
      message: "The map lookup did not finish. Try again in a moment.",
    };
  }
}
