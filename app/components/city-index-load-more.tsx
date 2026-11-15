"use client";

import Link from "next/link";
import type { CityRecord } from "../cities";
import { LoadMoreList } from "./load-more";

export function CityIndexLoadMore({
  cities,
  noun = "cities",
}: {
  cities: CityRecord[];
  noun?: string;
}) {
  return (
    <LoadMoreList items={cities} mobileSize={6} desktopSize={12} noun={noun}>
      {(visible) => (
        <ul className="divide-y divide-ink/10 border border-ink/15 bg-chart">
          {visible.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="flex flex-col gap-1 px-4 py-4 hover:bg-paper sm:flex-row sm:items-baseline sm:justify-between sm:px-5"
              >
                <span className="font-display text-2xl leading-none tracking-tight">
                  {city.city}
                </span>
                <span className="text-sm text-muted">
                  {city.events.length > 0
                    ? `${city.events.length} confirmed ${
                        city.events.length === 1 ? "event" : "events"
                      } · `
                    : null}
                  {city.places.length} organiser{" "}
                  {city.places.length === 1 ? "page" : "pages"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}
