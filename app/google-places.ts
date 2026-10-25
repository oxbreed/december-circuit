/**
 * Optional Google Places API (New) — server-only Explore enrichment.
 * When GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY) is empty, callers skip this
 * module and Explore stays on Overpass (+ optional Foursquare).
 * Short “use cache” only — no durable dump into pins.ts / places.ts.
 * Never scrape Google Maps HTML or Airbnb.
 */

import "server-only";

import { cacheLife } from "next/cache";
import {
  isGooglePlacesKind,
  type GooglePlacesKind,
  type PoiCity,
  type PoiKind,
} from "./poi-client";

export { googlePlacesKinds, isGooglePlacesKind, type GooglePlacesKind } from "./poi-client";

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

type GoogleKindConfig = {
  /** Nearby Search includedTypes (Table A). */
  includedTypes: string[];
  /** Text Search includedType (single) when a name filter is set. */
  textIncludedType: string;
  /** Words appended to textQuery for bias — not invented venue names. */
  textHint: string;
  categoryFallback: string;
};

const KIND_CONFIG: Record<GooglePlacesKind, GoogleKindConfig> = {
  hotels: {
    includedTypes: ["lodging"],
    textIncludedType: "lodging",
    textHint: "hotel lodging",
    categoryFallback: "Hotel",
  },
  restaurants: {
    includedTypes: ["restaurant"],
    textIncludedType: "restaurant",
    textHint: "restaurant",
    categoryFallback: "Restaurant",
  },
  /** Extended-stay only — not an Airbnb / short-let scrape. OSM tourism=apartment stays primary. */
  short_stays: {
    includedTypes: ["extended_stay_hotel"],
    textIncludedType: "extended_stay_hotel",
    textHint: "extended stay apartment hotel",
    categoryFallback: "Short stay",
  },
  shops: {
    includedTypes: ["shopping_mall", "department_store", "supermarket"],
    textIncludedType: "shopping_mall",
    textHint: "shopping mall store",
    categoryFallback: "Shop",
  },
  car_rental: {
    includedTypes: ["car_rental"],
    textIncludedType: "car_rental",
    textHint: "car rental",
    categoryFallback: "Car rental",
  },
  car_shops: {
    includedTypes: ["car_dealer", "car_repair"],
    textIncludedType: "car_dealer",
    textHint: "car dealer repair",
    categoryFallback: "Car shop",
  },
  clubs: {
    includedTypes: ["night_club", "bar"],
    textIncludedType: "night_club",
    textHint: "nightclub bar nightlife",
    categoryFallback: "Club or bar",
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

function categoryFromPlace(
  row: Record<string, unknown>,
  kind: GooglePlacesKind,
): string {
  const primary = asRecord(row.primaryTypeDisplayName);
  const primaryText = primary ? asString(primary.text) : null;
  if (primaryText) return primaryText;
  const types = row.types;
  if (Array.isArray(types)) {
    if (types.includes("hotel")) return "Hotel";
    if (types.includes("hostel")) return "Hostel";
    if (types.includes("guest_house")) return "Guest house";
    if (types.includes("extended_stay_hotel")) return "Extended stay";
    if (types.includes("lodging")) return "Lodging";
    if (types.includes("restaurant")) return "Restaurant";
    if (types.includes("shopping_mall")) return "Shopping mall";
    if (types.includes("department_store")) return "Department store";
    if (types.includes("supermarket")) return "Supermarket";
    if (types.includes("car_rental")) return "Car rental";
    if (types.includes("car_dealer")) return "Car dealer";
    if (types.includes("car_repair")) return "Car repair";
    if (types.includes("night_club")) return "Night club";
    if (types.includes("bar")) return "Bar";
  }
  return KIND_CONFIG[kind].categoryFallback;
}

function readPlaces(
  payload: unknown,
  kind: GooglePlacesKind,
  limit: number,
): GooglePlace[] {
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
      category: categoryFromPlace(row, kind),
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
  kind: GooglePlacesKind,
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
  return readPlaces(await response.json(), kind, MAX_RESULTS);
}

async function fetchKindSearch(
  city: PoiCity,
  kind: GooglePlacesKind,
  q: string,
): Promise<GooglePlace[]> {
  const centre = CITY_CENTRES[city];
  const config = KIND_CONFIG[kind];
  const circle = {
    center: {
      latitude: centre.latitude,
      longitude: centre.longitude,
    },
    radius: centre.radiusMeters,
  };
  const query = q.trim();

  if (query) {
    return postPlaces(
      "/places:searchText",
      {
        textQuery: `${query} ${config.textHint} ${centre.near}`,
        includedType: config.textIncludedType,
        maxResultCount: MAX_RESULTS,
        locationBias: { circle },
        languageCode: "en",
      },
      kind,
    );
  }

  return postPlaces(
    "/places:searchNearby",
    {
      includedTypes: config.includedTypes,
      maxResultCount: MAX_RESULTS,
      locationRestriction: { circle },
      languageCode: "en",
    },
    kind,
  );
}

/** ~45 minute server cache keyed by city / kind / query — same pattern as Foursquare. */
async function cachedKindSearch(
  city: PoiCity,
  kind: GooglePlacesKind,
  q: string,
): Promise<GooglePlace[]> {
  "use cache";
  cacheLife({ stale: 2700, revalidate: 2700, expire: 2700 });
  return fetchKindSearch(city, kind, q);
}

/**
 * Nearby / text search for supported Explore kinds. Returns [] when the key is
 * missing, the kind is out of scope, or the call fails so Overpass remains primary.
 */
export async function searchGooglePlaces(
  city: PoiCity,
  kind: PoiKind,
  q = "",
): Promise<GooglePlace[]> {
  if (!isGooglePlacesConfigured()) return [];
  if (!isGooglePlacesKind(kind)) return [];
  try {
    return await cachedKindSearch(city, kind, q.trim().toLowerCase());
  } catch {
    return [];
  }
}

/** @deprecated Prefer searchGooglePlaces(city, "hotels", q). Kept for call-site clarity. */
export async function searchGoogleHotels(
  city: PoiCity,
  q = "",
): Promise<GooglePlace[]> {
  return searchGooglePlaces(city, "hotels", q);
}
