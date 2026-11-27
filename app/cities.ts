import { events, type CircuitEvent } from "./events";
import { places, type Place } from "./places";

export type CityRecord = {
  slug: string;
  city: string;
  country: string;
  places: Place[];
  events: CircuitEvent[];
};

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function citiesOnFile(): CityRecord[] {
  const grouped = new Map<string, CityRecord>();
  for (const place of places) {
    const key = `${place.country}\u0000${place.city}`;
    const found = grouped.get(key);
    if (found) found.places.push(place);
    else {
      grouped.set(key, {
        slug: "",
        city: place.city,
        country: place.country,
        places: [place],
        events: [],
      });
    }
  }

  const cities = [...grouped.values()].sort((a, b) =>
    a.country === b.country
      ? a.city.localeCompare(b.city)
      : a.country.localeCompare(b.country),
  );

  const slugUses = new Map<string, number>();
  for (const city of cities) {
    const base = slugify(city.city);
    slugUses.set(base, (slugUses.get(base) ?? 0) + 1);
  }
  for (const city of cities) {
    const base = slugify(city.city);
    city.slug =
      (slugUses.get(base) ?? 0) > 1
        ? `${base}-${slugify(city.country)}`
        : base;
    city.events = events.filter((event) => event.region === city.city);
  }

  return cities;
}

export function cityBySlug(slug: string) {
  return citiesOnFile().find((city) => city.slug === slug) ?? null;
}

export function cityRecordFor(city: string, country: string) {
  return (
    citiesOnFile().find((item) => item.city === city && item.country === country) ??
    null
  );
}

/**
 * Verified records on a city page = confirmed events + organiser place rows
 * already on file for that city. Used for thin-page noindex.
 */
export function cityVerifiedCount(city: CityRecord) {
  return city.events.length + city.places.length;
}

/** Fewer than three verified records → noindex (page stays human-usable). */
export const CITY_INDEX_MIN_VERIFIED = 3;

export function cityIsThin(city: CityRecord) {
  return cityVerifiedCount(city) < CITY_INDEX_MIN_VERIFIED;
}

export function cityDescription(city: CityRecord) {
  const where = `${city.city}, ${city.country}`;
  const places = city.places.length;
  const kinds = [...new Set(city.places.map((place) => place.category.toLowerCase()))]
    .slice(0, 3)
    .join(", ");
  const placeBit = places
    ? `${places} ${places === 1 ? "place" : "places"} listed${kinds ? `, from ${kinds}` : ""}`
    : "";
  if (city.events.length === 0) {
    return `${where} guide for Detty December 2026: ${placeBit || "places on file"}. No confirmed December event is listed for this city yet.`;
  }
  const eventBit = `${city.events.length} confirmed December 2026 ${
    city.events.length === 1 ? "event" : "events"
  }`;
  return `${where} guide for Detty December 2026: ${eventBit}${placeBit ? ` and ${placeBit}` : ""}. See dates, venues and official links.`;
}
