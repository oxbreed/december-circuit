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

export function cityDescription(city: CityRecord) {
  const pages = `${city.places.length} organiser ${
    city.places.length === 1 ? "page" : "pages"
  }`;
  if (city.events.length === 0) {
    return `${city.city}, ${city.country}. ${pages} on file. No confirmed event is on file for this city.`;
  }
  const confirmed = `${city.events.length} confirmed ${
    city.events.length === 1 ? "event" : "events"
  }`;
  return `${city.city}, ${city.country}. ${confirmed} and ${pages} on file.`;
}
