/** Client-safe POI labels and types (no Overpass / cache). */

import { intakeCities, type IntakeCity } from "./place-intake";

export const poiCities = intakeCities;
export type PoiCity = IntakeCity;

/**
 * Explore map kinds. Overpass is primary for every kind.
 * Optional Google Places (when keyed) covers a subset — see google-places.ts.
 * Optional Foursquare covers a subset — see foursquare.ts.
 */
export const poiKinds = [
  "hotels",
  "restaurants",
  "short_stays",
  "shops",
  "car_rental",
  "car_shops",
  "clubs",
  "landmarks",
] as const;
export type PoiKind = (typeof poiKinds)[number];

export type PoiSource = "openstreetmap" | "foursquare" | "google";

export type PoiResult = {
  id: string;
  name: string;
  category: string;
  kind: PoiKind;
  city: PoiCity;
  area: string | null;
  /** Street address when tagged or returned by a third-party source — never invented. */
  address: string | null;
  /** Phone when tagged or returned by a third-party source — never invented. */
  phone: string | null;
  /** OSM opening_hours text when tagged — never invented. */
  openingHours: string | null;
  latitude: number;
  longitude: number;
  website: string | null;
  osmUrl: string | null;
  /** Google Maps place URL when returned by Places API — outbound only, never invented. */
  googleMapsUrl: string | null;
  sources: PoiSource[];
};

export const poiKindFilters: Record<PoiKind, { label: string }> = {
  hotels: { label: "Hotels" },
  restaurants: { label: "Restaurants" },
  short_stays: { label: "Short stays" },
  shops: { label: "Shopping" },
  car_rental: { label: "Car rental" },
  car_shops: { label: "Car shops" },
  clubs: { label: "Clubs & bars" },
  landmarks: { label: "Landmarks" },
};

/**
 * Explore kinds that may call Google Places when GOOGLE_PLACES_API_KEY is set.
 * Clubs and landmarks stay Overpass (± Foursquare) only.
 */
export const googlePlacesKinds = [
  "hotels",
  "restaurants",
  "short_stays",
  "shops",
  "car_rental",
  "car_shops",
] as const satisfies readonly PoiKind[];

export type GooglePlacesKind = (typeof googlePlacesKinds)[number];

export function isGooglePlacesKind(kind: PoiKind): kind is GooglePlacesKind {
  return (googlePlacesKinds as readonly string[]).includes(kind);
}
