import type { CircuitEvent } from "./events";
import { pinForName } from "./geo";
import { placeRecordFor, type PlaceRecord } from "./place-catalog";
import { places } from "./places";

const stayCategories = new Set(["Hotels", "Short-stay"]);

export type NearbyStay = {
  place: PlaceRecord;
  /** True when a sourced pin matched the place name in the event city. */
  hasPin: boolean;
};

/**
 * Sourced Hotels / Short-stay rows in the same city as the event region.
 * No invented venues — empty when the region has no stay listings on file
 * (e.g. region "Ghana" with no city match).
 */
export function nearbyStaysFor(event: CircuitEvent, limit = 6): NearbyStay[] {
  const city = event.region;
  const rows = places.filter(
    (place) => place.city === city && stayCategories.has(place.category),
  );
  const out: NearbyStay[] = [];
  for (const place of rows) {
    const record = placeRecordFor(place);
    if (!record) continue;
    out.push({
      place: record,
      hasPin: Boolean(pinForName(city, place.name)),
    });
    if (out.length >= limit) break;
  }
  return out;
}
