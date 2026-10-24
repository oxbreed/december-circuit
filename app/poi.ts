/** OpenStreetMap POI search — map results only, not verified directory records. */

import "server-only";

import {
  isFoursquareConfigured,
  searchFoursquareNearby,
  type FoursquarePlace,
} from "./foursquare";
import {
  poiCities,
  poiKindFilters as kindLabels,
  poiKinds,
  type PoiCity,
  type PoiKind,
  type PoiResult,
  type PoiSource,
} from "./poi-client";
import { isIntakeCity } from "./place-intake";
import { queryOverpassPois, type OverpassPoi } from "./overpass";

export { poiCities, poiKinds };
export type { PoiCity, PoiKind, PoiResult, PoiSource };

/** Tight bbox around each city centre — not the whole country. south,west,north,east */
export const poiCityBounds: Record<
  PoiCity,
  { south: number; west: number; north: number; east: number; label: string }
> = {
  Lagos: {
    south: 6.38,
    west: 3.3,
    north: 6.55,
    east: 3.5,
    label: "Lagos Island / Victoria Island / Ikoyi",
  },
  Accra: {
    south: 5.52,
    west: -0.28,
    north: 5.68,
    east: -0.1,
    label: "central Accra",
  },
  Calabar: {
    south: 4.9,
    west: 8.28,
    north: 5.05,
    east: 8.4,
    label: "central Calabar",
  },
};

/** Overpass tag filters per kind. Labels are derived from the matching OSM tags. */
export const poiKindFilters: Record<
  PoiKind,
  { label: string; filters: string[]; categoryFallback: string }
> = {
  hotels: {
    label: kindLabels.hotels.label,
    filters: ['["tourism"="hotel"]', '["tourism"="guest_house"]', '["tourism"="hostel"]'],
    categoryFallback: "Hotel",
  },
  restaurants: {
    label: kindLabels.restaurants.label,
    filters: ['["amenity"="restaurant"]'],
    categoryFallback: "Restaurant",
  },
  clubs: {
    label: kindLabels.clubs.label,
    filters: ['["amenity"="nightclub"]', '["amenity"="bar"]'],
    categoryFallback: "Club or bar",
  },
  landmarks: {
    label: kindLabels.landmarks.label,
    filters: [
      '["tourism"="attraction"]',
      '["tourism"="museum"]',
      '["historic"="monument"]',
      '["historic"="memorial"]',
    ],
    categoryFallback: "Landmark",
  },
};

const MAX_RESULTS = 30;
/** Fetch a little headroom so name filters still have candidates after drop. */
const OVERPASS_FETCH_CAP = 40;
/** Match OSM ↔ Foursquare when names align and points are within this distance. */
const MATCH_METERS = 200;

export function isPoiCity(value: string): value is PoiCity {
  return isIntakeCity(value);
}

export function isPoiKind(value: string): value is PoiKind {
  return (poiKinds as readonly string[]).includes(value);
}

function categoryFromTags(tags: Record<string, string>, kind: PoiKind): string {
  const tourism = tags.tourism;
  const amenity = tags.amenity;
  const historic = tags.historic;
  if (kind === "hotels") {
    if (tourism === "guest_house") return "Guest house";
    if (tourism === "hostel") return "Hostel";
    if (tourism === "hotel") return "Hotel";
  }
  if (kind === "restaurants" && amenity === "restaurant") return "Restaurant";
  if (kind === "clubs") {
    if (amenity === "nightclub") return "Nightclub";
    if (amenity === "bar") return "Bar";
  }
  if (kind === "landmarks") {
    if (tourism === "museum") return "Museum";
    if (historic === "monument") return "Monument";
    if (historic === "memorial") return "Memorial";
    if (tourism === "attraction") return "Attraction";
  }
  return poiKindFilters[kind].categoryFallback;
}

function areaFromTags(tags: Record<string, string>): string | null {
  const area =
    tags["addr:suburb"] ||
    tags["addr:neighbourhood"] ||
    tags["addr:quarter"] ||
    tags["addr:district"] ||
    tags["addr:city"] ||
    "";
  const trimmed = area.trim();
  return trimmed || null;
}

/** Compose a street line only from tagged addr:* fields — never invented. */
function addressFromTags(tags: Record<string, string>): string | null {
  const full = (tags["addr:full"] || "").trim();
  if (full) return full;
  const number = (tags["addr:housenumber"] || "").trim();
  const street = (tags["addr:street"] || "").trim();
  if (number && street) return `${number} ${street}`;
  if (street) return street;
  return null;
}

function phoneFromTags(tags: Record<string, string>): string | null {
  const raw =
    (tags.phone || tags["contact:phone"] || tags["contact:mobile"] || "").trim();
  return raw || null;
}

function openingHoursFromTags(tags: Record<string, string>): string | null {
  const raw = (tags.opening_hours || "").trim();
  return raw || null;
}

function websiteFromTags(tags: Record<string, string>): string | null {
  const raw = (tags.website || tags["contact:website"] || "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("www.") || /^[a-z0-9.-]+\.[a-z]{2,}([/?#].*)?$/i.test(raw)) {
    return `https://${raw}`;
  }
  return null;
}

function toResult(row: OverpassPoi, city: PoiCity, kind: PoiKind): PoiResult | null {
  const name = (row.tags.name || row.tags["name:en"] || "").trim();
  if (!name) return null;
  return {
    id: row.id,
    name,
    category: categoryFromTags(row.tags, kind),
    kind,
    city,
    area: areaFromTags(row.tags),
    address: addressFromTags(row.tags),
    phone: phoneFromTags(row.tags),
    openingHours: openingHoursFromTags(row.tags),
    latitude: row.latitude,
    longitude: row.longitude,
    website: websiteFromTags(row.tags),
    osmUrl: row.osmUrl,
    sources: ["openstreetmap"],
  };
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function haversineMeters(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function namesLikelyMatch(a: string, b: string): boolean {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.includes(right) || right.includes(left)) return true;
  const leftTokens = new Set(left.split(" ").filter((t) => t.length > 2));
  const rightTokens = right.split(" ").filter((t) => t.length > 2);
  if (leftTokens.size === 0 || rightTokens.length === 0) return false;
  let hit = 0;
  for (const token of rightTokens) {
    if (leftTokens.has(token)) hit += 1;
  }
  return hit >= Math.min(2, rightTokens.length);
}

function mergeFoursquareIntoOsm(
  osm: PoiResult,
  fsq: FoursquarePlace,
): PoiResult {
  const sources: PoiSource[] = osm.sources.includes("foursquare")
    ? osm.sources
    : [...osm.sources, "foursquare"];
  return {
    ...osm,
    address: osm.address || fsq.address,
    phone: osm.phone || fsq.phone,
    website: osm.website || fsq.website,
    sources,
  };
}

function foursquareToResult(
  place: FoursquarePlace,
  city: PoiCity,
  kind: PoiKind,
): PoiResult {
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    kind,
    city,
    area: null,
    address: place.address,
    phone: place.phone,
    openingHours: null,
    latitude: place.latitude,
    longitude: place.longitude,
    website: place.website,
    osmUrl: null,
    sources: ["foursquare"],
  };
}

function mergeWithFoursquare(
  osmResults: PoiResult[],
  fsqPlaces: FoursquarePlace[],
  city: PoiCity,
  kind: PoiKind,
  needle: string,
): PoiResult[] {
  if (fsqPlaces.length === 0) return osmResults.slice(0, MAX_RESULTS);

  const usedFsq = new Set<string>();
  const merged = osmResults.map((row) => {
    let best: FoursquarePlace | null = null;
    let bestDist = MATCH_METERS;
    for (const place of fsqPlaces) {
      if (usedFsq.has(place.id)) continue;
      if (!namesLikelyMatch(row.name, place.name)) continue;
      const dist = haversineMeters(
        row.latitude,
        row.longitude,
        place.latitude,
        place.longitude,
      );
      if (dist <= bestDist) {
        best = place;
        bestDist = dist;
      }
    }
    if (!best) return row;
    usedFsq.add(best.id);
    return mergeFoursquareIntoOsm(row, best);
  });

  const extras: PoiResult[] = [];
  for (const place of fsqPlaces) {
    if (usedFsq.has(place.id)) continue;
    if (needle) {
      const hay = `${place.name} ${place.category} ${place.address ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) continue;
    }
    extras.push(foursquareToResult(place, city, kind));
  }

  return [...merged, ...extras].slice(0, MAX_RESULTS);
}

export type PoiSearchOk = {
  status: "ok";
  results: PoiResult[];
  city: PoiCity;
  kind: PoiKind;
  sources: PoiSource[];
  foursquareEnabled: boolean;
};

export async function searchPois(
  city: string,
  kind: string,
  q = "",
): Promise<PoiSearchOk | { status: "error"; message: string }> {
  if (!isPoiCity(city)) {
    return { status: "error", message: "Choose Lagos, Accra, or Calabar." };
  }
  if (!isPoiKind(kind)) {
    return {
      status: "error",
      message: "Choose hotels, restaurants, clubs, or landmarks.",
    };
  }
  const needle = q.trim().toLowerCase();
  if (needle.length > 120) {
    return { status: "error", message: "Keep the name filter under 120 characters." };
  }

  const foursquareEnabled = isFoursquareConfigured();

  try {
    const bounds = poiCityBounds[city];
    const { filters } = poiKindFilters[kind];
    const rows = await queryOverpassPois(bounds, filters, OVERPASS_FETCH_CAP);
    const mapped: PoiResult[] = [];
    for (const row of rows) {
      const item = toResult(row, city, kind);
      if (!item) continue;
      if (needle) {
        const hay =
          `${item.name} ${item.category} ${item.area ?? ""} ${item.address ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) continue;
      }
      mapped.push(item);
      if (mapped.length >= MAX_RESULTS) break;
    }

    let results = mapped;
    if (foursquareEnabled) {
      const fsq = await searchFoursquareNearby(city, kind, needle);
      results = mergeWithFoursquare(mapped, fsq, city, kind, needle);
    }

    const sources: PoiSource[] = ["openstreetmap"];
    if (results.some((row) => row.sources.includes("foursquare"))) {
      sources.push("foursquare");
    }

    return {
      status: "ok",
      results,
      city,
      kind,
      sources,
      foursquareEnabled,
    };
  } catch {
    return {
      status: "error",
      message: "OpenStreetMap search did not finish. Try again in a moment.",
    };
  }
}
