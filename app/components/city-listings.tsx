"use client";

import Link from "next/link";
import type { CircuitEvent } from "../events";
import type { Place } from "../places";
import { placeRecordFor } from "../place-catalog";
import { EventCard } from "./event-card";
import { LoadMoreList } from "./load-more";
import { EmptyList } from "./states";

export function CityEventList({
  events,
  cityName,
}: {
  events: CircuitEvent[];
  cityName: string;
}) {
  if (events.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight">Confirmed events</h2>
        <div className="mt-5">
          <EmptyList href="/list" cta="List an event">
            No confirmed events are on file for {cityName} yet.
          </EmptyList>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="font-display text-3xl tracking-tight">Confirmed events</h2>
      <div className="mt-5">
        <LoadMoreList items={events} mobileSize={6} desktopSize={12} noun="events">
          {(visible) => (
            <div className="grid gap-4">
              {visible.map((event) => (
                <EventCard
                  key={`${event.region}-${event.when}-${event.summary}`}
                  event={event}
                />
              ))}
            </div>
          )}
        </LoadMoreList>
      </div>
    </section>
  );
}

export function CityPlaceList({
  places,
  cityName,
}: {
  places: Place[];
  cityName: string;
}) {
  if (places.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight">Organiser pages</h2>
        <div className="mt-5">
          <EmptyList href="/list#submit-place" cta="List a place">
            No organiser pages are on file for {cityName} yet.
          </EmptyList>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="font-display text-3xl tracking-tight">Organiser pages</h2>
      <div className="mt-5">
        <LoadMoreList items={places} mobileSize={6} desktopSize={12} noun="places">
          {(visible) => (
            <ul className="divide-y divide-ink/10 border border-ink/15 bg-chart">
              {visible.map((place) => {
                const record = placeRecordFor(place);
                const href = record ? `/place/${record.slug}` : null;
                return (
                  <li
                    key={`${place.category}-${place.name}`}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                        {place.category}
                      </p>
                      {href ? (
                        <Link
                          href={href}
                          className="mt-1 block font-display text-2xl leading-none break-words hover:text-oxide"
                        >
                          {place.name}
                        </Link>
                      ) : (
                        <p className="mt-1 font-display text-2xl leading-none break-words">
                          {place.name}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-1 text-sm sm:items-end">
                      {href ? (
                        <Link
                          href={href}
                          className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                        >
                          On this site
                        </Link>
                      ) : null}
                      <a
                        href={place.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted underline decoration-ink/20 underline-offset-4 hover:text-oxide"
                      >
                        Organiser page — leaves this site
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </LoadMoreList>
      </div>
    </section>
  );
}
