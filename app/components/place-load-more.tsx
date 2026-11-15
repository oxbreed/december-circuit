"use client";

import Link from "next/link";
import { cityRecordFor } from "../cities";
import type { PlaceRecord } from "../place-catalog";
import type { Place } from "../places";
import { LoadMoreList } from "./load-more";

export function PlaceOrganiserLoadMore({
  places,
  noun = "organiser pages",
}: {
  places: PlaceRecord[];
  noun?: string;
}) {
  return (
    <LoadMoreList items={places} mobileSize={6} desktopSize={12} noun={noun}>
      {(visible) => (
        <ul className="divide-y divide-ink/10 border border-ink/15 bg-chart">
          {visible.map((place) => {
            const city = cityRecordFor(place.city, place.country);
            return (
              <li key={place.slug} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:px-5">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">{place.city}, {place.country}</p>
                  <Link href={`/place/${place.slug}`} className="mt-1 block font-display text-2xl leading-none tracking-tight hover:text-oxide">{place.name}</Link>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-1 text-sm sm:items-end">
                  <Link href={`/place/${place.slug}`} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">On this site</Link>
                  {city ? <Link href={`/cities/${city.slug}`} className="text-muted underline decoration-ink/20 underline-offset-4 hover:text-oxide">{city.city} page</Link> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </LoadMoreList>
  );
}

export function PlaceOutboundLoadMore({
  places,
  noun = "places",
}: {
  places: Place[];
  noun?: string;
}) {
  return (
    <LoadMoreList items={places} mobileSize={6} desktopSize={12} noun={noun}>
      {(visible) => (
        <ul>
          {visible.map((place) => (
            <li key={place.name} className="border-t border-ink/10 py-3">
              <p className="text-sm leading-6 text-ink">{place.name}<span className="text-muted"> · {place.category}</span></p>
              {place.url ? (
                <a href={place.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                  Organiser page
                  <span className="sr-only"> — leaves this site</span>
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}
