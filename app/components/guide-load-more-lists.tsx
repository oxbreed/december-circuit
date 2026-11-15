"use client";

import Link from "next/link";
import type { CityRecord } from "../cities";
import type { CircuitEvent } from "../events";
import type { Pin } from "../pins";
import type { Place } from "../places";
import { EventCard } from "./event-card";
import { LoadMoreList } from "./load-more";

const stayFirst = ["Hotels", "Short-stay"];

function byCity<T extends { country: string; city: string }>(rows: T[]) {
  const groups: { country: string; city: string; rows: T[] }[] = [];
  for (const row of rows) {
    let group = groups.find((item) => item.country === row.country && item.city === row.city);
    if (!group) {
      group = { country: row.country, city: row.city, rows: [] };
      groups.push(group);
    }
    group.rows.push(row);
  }
  return groups;
}

function byCategory(rows: Place[]) {
  const names: string[] = [];
  for (const name of stayFirst) {
    if (rows.some((place) => place.category === name)) names.push(name);
  }
  for (const place of rows) {
    if (!names.includes(place.category)) names.push(place.category);
  }
  return names.map((category) => ({
    category,
    cities: byCity(rows.filter((place) => place.category === category)),
  }));
}

function PlaceGroups({ rows }: { rows: Place[] }) {
  const groups = byCategory(rows);
  if (groups.length === 0) return null;
  return (
    <div className="grid gap-10">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-lagoon">{group.category}</h3>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {group.cities.map((city) => (
              <section key={`${city.country}-${city.city}`} className="min-w-0">
                <h4 className="font-display text-2xl leading-tight tracking-tight">{city.city}, {city.country}</h4>
                <ul className="mt-2">
                  {city.rows.map((place) => (
                    <li key={`${place.category}-${place.name}`} className="border-t border-ink/10 py-3">
                      <p className="text-sm leading-6 text-ink">{place.name}</p>
                      {place.url ? (
                        <a href={place.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">Organiser page</a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GuidePlaceLoadMore({ places, noun = "places" }: { places: Place[]; noun?: string }) {
  if (places.length === 0) return null;
  return (
    <div className="mt-8">
      <LoadMoreList items={places} mobileSize={6} desktopSize={12} noun={noun}>
        {(visible) => <PlaceGroups rows={visible} />}
      </LoadMoreList>
    </div>
  );
}

export function GuidePinLoadMore({ pins }: { pins: Pin[] }) {
  if (pins.length === 0) return null;
  return (
    <LoadMoreList items={pins} mobileSize={6} desktopSize={12} noun="pins">
      {(visible) => (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {byCity(visible).map((city) => (
            <section key={`${city.country}-${city.city}`} className="min-w-0">
              <h4 className="font-display text-2xl leading-tight tracking-tight">{city.city}, {city.country}</h4>
              <ul className="mt-2">
                {city.rows.map((pin) => (
                  <li key={`${pin.name}-${pin.latitude}-${pin.longitude}`} className="border-t border-ink/10 py-3">
                    <p className="text-sm leading-6 text-ink">{pin.name}</p>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {pin.url ? <a href={pin.url} target="_blank" rel="noopener noreferrer" className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">Organiser page</a> : null}
                      <Link href="/map" className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">On the map</Link>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </LoadMoreList>
  );
}

export function GuideCitiesLoadMore({ cities }: { cities: CityRecord[] }) {
  return (
    <LoadMoreList items={cities} mobileSize={12} desktopSize={24} noun="cities">
      {(visible) => (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {visible.map((city) => (
            <li key={city.slug}>
              <Link href={`/cities/${city.slug}`} className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">{city.city}</Link>
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}

export function GuideWhatsOnLoadMore({ events }: { events: CircuitEvent[] }) {
  return (
    <LoadMoreList items={events} mobileSize={6} desktopSize={12} noun="events">
      {(visible) => (
        <div className="grid gap-4">
          {visible.map((event) => (
            <EventCard key={`${event.region}-${event.when}-${event.summary}`} event={event} as="h3" />
          ))}
        </div>
      )}
    </LoadMoreList>
  );
}
