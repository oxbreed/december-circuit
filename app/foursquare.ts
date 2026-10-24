/**
 * Optional Foursquare Places API (server-only).
 * When FOURSQUARE_API_KEY is empty, callers skip this module and Explore stays on Overpass.
 * Requests Pro fields only — no ratings, photos, tips, or Premium hours.
 */

import "server-only";

import { cacheLife } from "next/cache";
import type { PoiCity, PoiKind } from "./poi-client";

const PLACES_BASE = "https://places-api.foursquare.com";
const API_VERSION = "2025-06-17";
const FETCH_TIMEOUT_MS = 12_000;
const MAX_RESULTS = 30;
/** Soft cap: one Place Search per city/kind/q (cached). Avoid fan-out detail calls. */
const MIN_GAP_MS = 400;

/** Classic Foursquare category IDs used to scope Place Search. */
const KIND_CATEGORY_IDS: Record<PoiKind, string> = {
  hotels: "4bf58dd8d48988d1fa931735,4bf58dd8d48988d1ee931735", // Hotel, Hostel
  restaurants: "4d4b7105d754a06374d81259", // Food / Restaurants
  clubs: "4bf58dd8d48988d11f941735,4bf58dd8d48988d116941735", // Night Clubs, Bar
  landmarks: "4bf58dd8d48988d181941735,4bf58dd8d48988d12d941735", // Museum, Monument / Landmark
};

const KIND_QUERY: Record<PoiKind, string> = {
  hotels: "hotel",
  restaurants: "restaurant",
  clubs: "nightlife",
  landmarks: "museum",
};

/** Centre of each Explore bbox + search radius covering that bbox. */
export const foursquareCityCentres: Record<
  PoiCity,
  { latitude: number; longitude: number; radiusMeters: number; near: string }
> = {
  Lagos: {
    latitude: 6.465,
    longitude: 3.4,
    radiusMeters: 12_000,
    near: "Lagos, Nigeria",
  },
  Accra: {
    latitude: 5.6,
    longitude: -0.19,
    radiusMeters: 12_000,
    near: "Accra, Ghana",
  },
  Calabar: {
    latitude: 4.975,
    longitude: 8.34,
    radiusMeters: 10_000,
    near: "Calabar, Nigeria",
  },
};

export type FoursquarePlace = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  latitude: number;
  longitude: number;
};

let lastCallAt = 0;
let callChain: Promise<void> = Promise.resolve();

function waitForSlot() {
  const run = callChain.then(async () => {
    const now = Date.now();
    const wait = Math.max(0, lastCallAt + MIN_GAP_MS - now);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastCallAt = Date.now();
  });
  callChain = run.catch(() => undefined);
  return run;
}

export function foursquareApiKey(): string | null {
  const key = process.env.FOURSQUARE_API_KEY?.trim();
  return key || null;
}

export function isFoursquareConfigured(): boolean {
  return Boolean(foursquareApiKey());
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function asNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function normalizeWebsite(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("www.") || /^[a-z0-9.-]+\.[a-z]{2,}([/?#].*)?$/i.test(raw)) {
    return `https://${raw}`;
  }
  return null;
}

function formatAddress(location: Record<string, unknown> | null): string | null {
  if (!location) return null;
  const formatted = asString(location.formatted_address);
  if (formatted) return formatted;
  const parts = [
    asString(location.address),
    asString(location.locality),
    asString(location.region),
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function categoryFromPlace(row: Record<string, unknown>, kind: PoiKind): string {
  const categories = row.categories;
  if (Array.isArray(categories) && categories.length > 0) {
    const first = asRecord(categories[0]);
    const name = first ? asString(first.name) : null;
    if (name) return name;
  }
  if (kind === "hotels") return "Hotel";
  if (kind === "restaurants") return "Restaurant";
  if (kind === "clubs") return "Nightlife";
  return "Landmark";
}

function readPlaces(payload: unknown, kind: PoiKind, limit: number): FoursquarePlace[] {
  const root = asRecord(payload);
  if (!root) return [];
  const results = root.results;
  if (!Array.isArray(results)) return [];
  const out: FoursquarePlace[] = [];
  for (const item of results) {
    const row = asRecord(item);
    if (!row) continue;
    const id = asString(row.fsq_place_id);
    const name = asString(row.name);
    const latitude = asNumber(row.latitude);
    const longitude = asNumber(row.longitude);
    if (!id || !name || latitude === null || longitude === null) continue;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) continue;
    out.push({
      id: `fsq/${id}`,
      name,
      category: categoryFromPlace(row, kind),
      address: formatAddress(asRecord(row.location)),
      phone: asString(row.tel),
      website: normalizeWebsite(asString(row.website)),
      latitude,
      longitude,
    });
    if (out.length >= limit) break;
  }
  return out;
}

async function fetchPlaceSearch(
  city: PoiCity,
  kind: PoiKind,
  q: string,
): Promise<FoursquarePlace[]> {
  const key = foursquareApiKey();
  if (!key) return [];

  await waitForSlot();
  const centre = foursquareCityCentres[city];
  const params = new URLSearchParams({
    ll: `${centre.latitude},${centre.longitude}`,
    radius: String(centre.radiusMeters),
    limit: String(MAX_RESULTS),
    fsq_category_ids: KIND_CATEGORY_IDS[kind],
    // Pro fields only — omit rating, price, hours, photos, tips (Premium).
    fields: "fsq_place_id,name,categories,location,latitude,longitude,tel,website",
  });
  const query = q.trim() || KIND_QUERY[kind];
  if (query) params.set("query", query);

  const response = await fetch(`${PLACES_BASE}/places/search?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${key}`,
      "X-Places-Api-Version": API_VERSION,
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("foursquare unauthorized");
  }
  if (response.status === 429 || response.status >= 500) {
    throw new Error(`foursquare ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(`foursquare ${response.status}`);
  }
  return readPlaces(await response.json(), kind, MAX_RESULTS);
}

/** ~45 minute server cache keyed by city / kind / query. */
async function cachedPlaceSearch(
  city: PoiCity,
  kind: PoiKind,
  q: string,
): Promise<FoursquarePlace[]> {
  "use cache";
  cacheLife({ stale: 2700, revalidate: 2700, expire: 2700 });
  return fetchPlaceSearch(city, kind, q);
}

/**
 * Nearby Place Search for Explore. Returns [] when the key is missing or the call fails
 * so Overpass remains the primary path.
 */
export async function searchFoursquareNearby(
  city: PoiCity,
  kind: PoiKind,
  q = "",
): Promise<FoursquarePlace[]> {
  if (!isFoursquareConfigured()) return [];
  try {
    return await cachedPlaceSearch(city, kind, q.trim().toLowerCase());
  } catch {
    return [];
  }
}
