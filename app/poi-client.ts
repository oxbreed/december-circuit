/** Client-safe POI labels and types (no Overpass / cache). */

import { intakeCities, type IntakeCity } from "./place-intake";

export const poiCities = intakeCities;
export type PoiCity = IntakeCity;

export const poiKinds = ["hotels", "restaurants", "clubs", "landmarks"] as const;
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
  clubs: { label: "Clubs & bars" },
  landmarks: { label: "Landmarks" },
};
