import { citiesOnFile, slugify, type CityRecord } from "./cities";
import { events, type CircuitEvent } from "./events";

export type CountryRecord = {
  slug: string;
  country: string;
  cities: CityRecord[];
  /** Sourced organiser pages already listed for cities in this country. */
  placeCount: number;
  events: CircuitEvent[];
};

export function countriesOnFile(): CountryRecord[] {
  const cities = citiesOnFile();
  const byCountry = new Map<string, CityRecord[]>();
  for (const city of cities) {
    const list = byCountry.get(city.country) ?? [];
    list.push(city);
    byCountry.set(city.country, list);
  }

  return [...byCountry.entries()]
    .map(([country, rows]) => {
      const cityNames = new Set(rows.map((row) => row.city));
      return {
        slug: slugify(country),
        country,
        cities: rows,
        placeCount: rows.reduce((sum, city) => sum + city.places.length, 0),
        events: events.filter(
          (event) =>
            cityNames.has(event.region) ||
            event.region === country ||
            // Ghana season record uses region "Ghana"
            (country === "Ghana" && event.region === "Ghana"),
        ),
      };
    })
    .sort((a, b) => a.country.localeCompare(b.country));
}

export function countryBySlug(slug: string) {
  return countriesOnFile().find((item) => item.slug === slug) ?? null;
}

export function countryDescription(country: CountryRecord) {
  const cityCount = country.cities.length;
  const placeCount = country.placeCount;
  const eventCount = country.events.length;
  const cities = `${cityCount} ${cityCount === 1 ? "city" : "cities"}`;
  const pages = `${placeCount} organiser ${placeCount === 1 ? "page" : "pages"}`;
  if (eventCount === 0) {
    return `${country.country} on dirtydecember.info — ${cities} and ${pages} listed for West Africa tourism. No confirmed December event is listed for this country yet.`;
  }
  return `${country.country} on dirtydecember.info — ${cities}, ${pages}, and ${eventCount} confirmed December ${
    eventCount === 1 ? "event" : "events"
  } on file for Detty December planning and the season.`;
}

/** Existing Places directory filter — country name must match sourced place.country. */
export function placesCountryHref(country: string) {
  return `/places?country=${encodeURIComponent(country)}`;
}
