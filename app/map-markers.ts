import { eventDateSpan } from "./event-dates";
import { events } from "./events";
import { pinForName } from "./geo";
import { colorForIsoDate, MAP_PLACE_PIN_COLOR } from "./map-date-colors";
import {
  mapFilterGroupFromPlace,
  type MapFilterGroup,
} from "./map-marker-categories";
import { pinId } from "./components/pin-id";
import { eventNameAndVenue, eventSlug } from "./event-view";
import { places } from "./places";
import { pins } from "./pins";

export type MapMarkerKind = "place" | "event";

export type MapMarker = {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  kind: MapMarkerKind;
  /** Listed place or event category label. */
  category: string;
  filterGroup: MapFilterGroup;
  dateStart: string | null;
  when: string | null;
  url?: string;
  href?: string;
  pinColor: string;
};

export const MAP_FOCUS_CITIES = [
  "Lagos",
  "Abuja",
  "Accra",
  "Abidjan",
] as const;

export type MapFocusCity = (typeof MAP_FOCUS_CITIES)[number];

export function mapMarkerId(parts: {
  kind: MapMarkerKind;
  city: string;
  country: string;
  name: string;
  slug?: string;
}) {
  if (parts.kind === "event" && parts.slug) return `event|${parts.slug}`;
  return `place|${pinId(parts)}`;
}

export function mapMarkersOnFile(): MapMarker[] {
  const markers: MapMarker[] = [];
  const placePinKeys = new Set<string>();

  for (const place of places) {
    if (!(MAP_FOCUS_CITIES as readonly string[]).includes(place.city)) continue;
    const pin = pinForName(place.city, place.name);
    if (!pin) continue;
    const key = pinId(pin);
    if (placePinKeys.has(key)) continue;
    placePinKeys.add(key);
    markers.push({
      id: mapMarkerId({
        kind: "place",
        city: pin.city,
        country: pin.country,
        name: pin.name,
      }),
      name: pin.name,
      city: pin.city,
      country: pin.country,
      latitude: pin.latitude,
      longitude: pin.longitude,
      kind: "place",
      category: place.category,
      filterGroup: mapFilterGroupFromPlace(place.category),
      dateStart: null,
      when: null,
      url: place.url,
      href: undefined,
      pinColor: MAP_PLACE_PIN_COLOR,
    });
  }

  for (const event of events) {
    if (!(MAP_FOCUS_CITIES as readonly string[]).includes(event.region)) continue;
    const { venue, name } = eventNameAndVenue(event.summary);
    const pin = pinForName(event.region, venue);
    if (!pin) continue;
    const span = eventDateSpan(event.when);
    const dateStart = span?.start ?? null;
    const slug = eventSlug(event);
    markers.push({
      id: mapMarkerId({
        kind: "event",
        city: event.region,
        country: pin.country,
        name,
        slug,
      }),
      name,
      city: event.region,
      country: pin.country,
      latitude: pin.latitude,
      longitude: pin.longitude,
      kind: "event",
      category: "Confirmed event",
      filterGroup: "party",
      dateStart,
      when: event.when,
      url: event.url,
      href: `/events/${slug}`,
      pinColor: dateStart ? colorForIsoDate(dateStart) : MAP_PLACE_PIN_COLOR,
    });
  }

  return markers.sort((a, b) =>
    a.city === b.city
      ? a.name.localeCompare(b.name)
      : a.city.localeCompare(b.city),
  );
}

/** Focus cities that have at least one sourced coordinate on file. */
export function mapFocusCitiesWithPins(): MapFocusCity[] {
  return MAP_FOCUS_CITIES.filter((city) => pins.some((pin) => pin.city === city));
}

export function mapMarkersToCircuitPins(markers: MapMarker[]) {
  return markers.map((marker) => ({
    city: marker.city,
    country: marker.country,
    name: marker.name,
    latitude: marker.latitude,
    longitude: marker.longitude,
    url: marker.url,
    pinColor: marker.pinColor,
    markerId: marker.id,
  }));
}