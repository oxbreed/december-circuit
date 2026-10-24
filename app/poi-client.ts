/** Client-safe POI labels and types (no Overpass / cache). */

import { intakeCities, type IntakeCity } from "./place-intake";

export const poiCities = intakeCities;
export type PoiCity = IntakeCity;

export const poiKinds = ["hotels", "restaurants", "clubs", "landmarks"] as const;
export type PoiKind = (typeof poiKinds)[number];

export type PoiResult = {
  id: string;
  name: string;
  category: string;
  kind: PoiKind;
  city: PoiCity;
  area: string | null;
  latitude: number;
  longitude: number;
  website: string | null;
  osmUrl: string;
};

export const poiKindFilters: Record<PoiKind, { label: string }> = {
  hotels: { label: "Hotels" },
  restaurants: { label: "Restaurants" },
  clubs: { label: "Clubs & bars" },
  landmarks: { label: "Landmarks" },
};
