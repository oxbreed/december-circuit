/** OpenStreetMap POI search — map results only, not verified directory records. */

import "server-only";

import {
  poiCities,
  poiKindFilters as kindLabels,
  poiKinds,
  type PoiCity,
  type PoiKind,
  type PoiResult,
} from "./poi-client";
import { isIntakeCity } from "./place-intake";
import { queryOverpassPois, type OverpassPoi } from "./overpass";

export { poiCities, poiKinds };
export type { PoiCity, PoiKind, PoiResult };

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

function websiteFromTags(tags: Record<string, string>): string | null {
  const raw = (tags.website || tags["contact:website"] || "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("www.")) return `https://${raw}`;
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
    latitude: row.latitude,
    longitude: row.longitude,
    website: websiteFromTags(row.tags),
    osmUrl: row.osmUrl,
  };
}

export async function searchPois(
  city: string,
  kind: string,
  q = "",
): Promise<
  | { status: "ok"; results: PoiResult[]; city: PoiCity; kind: PoiKind }
  | { status: "error"; message: string }
> {
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

  try {
    const bounds = poiCityBounds[city];
    const { filters } = poiKindFilters[kind];
    const rows = await queryOverpassPois(bounds, filters, OVERPASS_FETCH_CAP);
    const mapped: PoiResult[] = [];
    for (const row of rows) {
      const item = toResult(row, city, kind);
      if (!item) continue;
      if (needle) {
        const hay = `${item.name} ${item.category} ${item.area ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) continue;
      }
      mapped.push(item);
      if (mapped.length >= MAX_RESULTS) break;
    }
    return { status: "ok", results: mapped, city, kind };
  } catch {
    return {
      status: "error",
      message: "OpenStreetMap search did not finish. Try again in a moment.",
    };
  }
}
