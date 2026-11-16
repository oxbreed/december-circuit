"use client";

import Link from "next/link";
import type { CityRecord } from "../cities";
import type { CountryRecord } from "../countries";
import type { CategoryIndexItem } from "../explore-categories";
import { LoadMoreList } from "./load-more";

function countryCountLine(placeCount: number, eventCount: number) {
  const places = `${placeCount} ${placeCount === 1 ? "place" : "places"}`;
  if (eventCount === 0) {
    return `${places} on file · no confirmed events yet`;
  }
  return `${places} · ${eventCount} confirmed ${eventCount === 1 ? "event" : "events"}`;
}

export function WestAfricaCountriesLoadMore({
  countries,
  placesHref,
}: {
  countries: CountryRecord[];
  placesHref: (country: string) => string;
}) {
  return (
    <LoadMoreList items={countries} mobileSize={6} desktopSize={12} noun="countries">
      {(visible) => (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((country) => (
            <li key={country.slug} className="border border-ink/15 bg-chart">
              <Link
                href={`/countries/${country.slug}`}
                className="block px-4 pt-5 pb-3 hover:bg-paper"
              >
                <p className="font-display text-2xl leading-none tracking-tight">
                  {country.country}
                </p>
                <p className="mt-3 text-sm text-muted">
                  {countryCountLine(country.placeCount, country.events.length)}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-oxide">
                  Country landing →
                </p>
              </Link>
              <p className="border-t border-ink/10 px-4 py-3 text-sm text-muted">
                <Link
                  href={placesHref(country.country)}
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  Places in {country.country}
                </Link>
                <span className="text-muted/60">
                  {" "}
                  · {country.cities.length}{" "}
                  {country.cities.length === 1 ? "city" : "cities"}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}

export function WestAfricaCategoriesLoadMore({
  categories,
}: {
  categories: CategoryIndexItem[];
}) {
  return (
    <LoadMoreList items={categories} mobileSize={6} desktopSize={12} noun="categories">
      {(visible) => (
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-6">
          {visible.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/categories/${item.slug}`}
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {item.category}
              </Link>
              <span className="text-muted">
                {" "}
                ({item.count > 0 ? item.count : item.exploreKind ? "Explore" : 0})
              </span>
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}

export function WestAfricaCityLinksLoadMore({ cities }: { cities: CityRecord[] }) {
  return (
    <LoadMoreList items={cities} mobileSize={6} desktopSize={12} noun="cities">
      {(visible) => (
        <ul className="mt-5 columns-1 gap-x-8 text-sm leading-6 sm:columns-2 lg:columns-3">
          {visible.map((city) => (
            <li key={city.slug} className="break-inside-avoid py-0.5">
              <Link
                href={`/cities/${city.slug}`}
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {city.city}
              </Link>
              <span className="text-muted">, {city.country}</span>
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}