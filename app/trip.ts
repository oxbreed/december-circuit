import type { CircuitEvent } from "./events";
import type { Place } from "./places";

export type TripKind = "event" | "place";

export function eventTripId(
  event: Pick<CircuitEvent, "region" | "when" | "summary">,
) {
  return `${event.region}\n${event.when}\n${event.summary}`;
}

export function placeTripId(
  place: Pick<Place, "country" | "city" | "category" | "name">,
) {
  return `${place.country}\n${place.city}\n${place.category}\n${place.name}`;
}
