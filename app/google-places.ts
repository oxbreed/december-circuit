/**
 * Optional Google Places API (New) — hotels / lodging only (server-only).
 * When GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY) is empty, callers skip this
 * module and Explore stays on Overpass (+ optional Foursquare).
 * Short “use cache” only — no durable dump into pins.ts.
 */

import "server-only";

import { cacheLife } from "next/cache";
import type { PoiCity } from "./poi-client";

const PLACES_BASE = "https://places.googleapis.com/v1";
const FETCH_TIMEOUT_MS = 12_000;
const MAX_RESULTS = 20;
const MIN_GAP_MS = 400;

/** Centre + radius covering each Explore city bbox (same footprint as Foursquare). */
const CITY_CENTRES: Record<
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

/** Field mask kept minimal — no reviews, photos, or price levels. */
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
  "places.primaryTypeDisplayName",
  "places.googleMapsUri",
  "places.websiteUri",
  "places.nationalPhoneNumber",
].join(",");

export type GooglePlace = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
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

/** Prefer GOOGLE_PLACES_API_KEY; accept GOOGLE_MAPS_API_KEY as an alias. */
export function googlePlacesApiKey(): string | null {
  const places = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (places) return places;
  const maps = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return maps || null;
}

export function isGooglePlacesConfigured(): boolean {
  return Boolean(googlePlacesApiKey());
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

function categoryFromPlace(row: Record<string, unknown>): string {
  const primary = asRecord(row.primaryTypeDisplayName);
  const primaryText = primary ? asString(primary.text) : null;
  if (primaryText) return primaryText;
  const types = row.types;
  if (Array.isArray(types)) {
    if (types.includes("hotel")) return "Hotel";
    if (types.includes("hostel")) return "Hostel";
    if (types.includes("guest_house")) return "Guest house";
    if (types.includes("lodging")) return "Lodging";
  }
  return "Hotel";
}

function readPlaces(payload: unknown, limit: number): GooglePlace[] {
  const root = asRecord(payload);
  if (!root) return [];
  const places = root.places;
  if (!Array.isArray(places)) return [];
  const out: GooglePlace[] = [];
  for (const item of places) {
    const row = asRecord(item);
    if (!row) continue;
    const rawId = asString(row.id) || asString(row.name);
    const display = asRecord(row.displayName);
    const name = display ? asString(display.text) : null;
    const location = asRecord(row.location);
    const latitude = location ? asNumber(location.latitude) : null;
    const longitude = location ? asNumber(location.longitude) : null;
    if (!rawId || !name || latitude === null || longitude === null) continue;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) continue;
    const placeId = rawId.startsWith("places/") ? rawId.slice("places/".length) : rawId;
    out.push({
      id: `google/${placeId}`,
      name,
      category: categoryFromPlace(row),
      address: asString(row.formattedAddress),
      phone: asString(row.nationalPhoneNumber),
      website: normalizeWebsite(asString(row.websiteUri)),
      googleMapsUrl: asString(row.googleMapsUri),
      latitude,
      longitude,
    });
    if (out.length >= limit) break;
  }
  return out;
}

async function postPlaces(
  path: string,
  body: Record<string, unknown>,
): Promise<GooglePlace[]> {
  const key = googlePlacesApiKey();
  if (!key) return [];

  await waitForSlot();
  const response = await fetch(`${PLACES_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("google places unauthorized");
  }
  if (response.status === 429 || response.status >= 500) {
    throw new Error(`google places ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(`google places ${response.status}`);
  }
  return readPlaces(await response.json(), MAX_RESULTS);
}

async function fetchHotelSearch(city: PoiCity, q: string): Promise<GooglePlace[]> {
  const centre = CITY_CENTRES[city];
  const circle = {
    center: {
      latitude: centre.latitude,
      longitude: centre.longitude,
    },
    radius: centre.radiusMeters,
  };
  const query = q.trim();

  if (query) {
    return postPlaces("/places:searchText", {
      textQuery: `${query} hotel lodging ${centre.near}`,
      includedType: "lodging",
      maxResultCount: MAX_RESULTS,
      locationBias: { circle },
      languageCode: "en",
    });
  }

  return postPlaces("/places:searchNearby", {
    includedTypes: ["lodging"],
    maxResultCount: MAX_RESULTS,
    locationRestriction: { circle },
    languageCode: "en",
  });
}

/** ~45 minute server cache keyed by city / query — same pattern as Foursquare. */
async function cachedHotelSearch(city: PoiCity, q: string): Promise<GooglePlace[]> {
  "use cache";
  cacheLife({ stale: 2700, revalidate: 2700, expire: 2700 });
  return fetchHotelSearch(city, q);
}

/**
 * Nearby / text search for Explore hotels. Returns [] when the key is missing
 * or the call fails so Overpass (+ Foursquare) remain the primary path.
 */
export async function searchGoogleHotels(
  city: PoiCity,
  q = "",
): Promise<GooglePlace[]> {
  if (!isGooglePlacesConfigured()) return [];
  try {
    return await cachedHotelSearch(city, q.trim().toLowerCase());
  } catch {
    return [];
  }
}
