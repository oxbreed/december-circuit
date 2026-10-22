"use client";

import { useMemo, useState } from "react";
import type { CircuitEvent } from "../events";
import type { Place } from "../places";
import { disclaimer } from "../brand";
import { LandmarkFrame } from "./landmark-frame";
import { EmptyNote, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

type CityEntry = { country: string; city: string; count: number };

type Activity = {
  key: string;
  name: string;
  cityLine: string;
  category: string;
  when?: string;
  url?: string;
  linkLabel: string;
  ticketsUrl?: string;
};

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesText(haystack: string, needle: string) {
  const folded = fold(haystack);
  const words = fold(needle).split(/\s+/).filter(Boolean);
  return words.every((word) => folded.includes(word));
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article className="flex h-full flex-col border border-ink/15 bg-chart p-4 shadow-[4px_4px_0_0_rgba(184,67,47,0.12)]">
      <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">{activity.category}</p>
      <h3 className="mt-2 font-display text-2xl leading-tight tracking-tight">
        {activity.url ? (
          <a
            href={activity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-oxide/40 underline-offset-4"
          >
            {activity.name}
          </a>
        ) : (
          activity.name
        )}
      </h3>
      <p className="mt-2 text-sm text-muted">{activity.cityLine}</p>
      {activity.when ? <p className="mt-1 text-sm text-ink">{activity.when}</p> : null}
      <p className="mt-3 text-sm text-muted">No traveller reviews on file</p>
      {activity.url ? (
        <a
          href={activity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-fit text-[11px] uppercase tracking-[0.16em] text-oxide"
        >
          {activity.linkLabel} — leaves this site
        </a>
      ) : (
        <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">
          No organiser page on file
        </p>
      )}
      {activity.ticketsUrl ? (
        <a
          href={activity.ticketsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex w-fit text-[11px] uppercase tracking-[0.16em] text-oxide"
        >
          Tickets
        </a>
      ) : null}
    </article>
  );
}

export function GuideSearch() {
  const places = useRecords<Place[]>("/api/places");
  const events = useRecords<CircuitEvent[]>("/api/events");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState<CityEntry | null>(null);

  const placeRecords = places.status === "ready" ? places.data : [];
  const eventRecords = events.status === "ready" ? events.data : [];
  const needle = query.trim();
  const filtering = needle.length > 0 || category.length > 0 || city !== null;

  const categories = useMemo(() => {
    const names: string[] = [];
    for (const place of placeRecords) {
      if (!names.includes(place.category)) names.push(place.category);
    }
    return names.sort((a, b) => a.localeCompare(b));
  }, [placeRecords]);

  const cities = useMemo(() => {
    const list: CityEntry[] = [];
    for (const place of placeRecords) {
      const found = list.find(
        (item) => item.country === place.country && item.city === place.city,
      );
      if (found) found.count += 1;
      else list.push({ country: place.country, city: place.city, count: 1 });
    }
    return list;
  }, [placeRecords]);

  const activities = useMemo(() => {
    if (!filtering) return [];
    const cards: Activity[] = [];
    for (const place of placeRecords) {
      if (category && fold(place.category) !== fold(category)) continue;
      if (city && (place.city !== city.city || place.country !== city.country)) continue;
      const haystack = `${place.name} ${place.city} ${place.country} ${place.category}`;
      if (needle && !matchesText(haystack, needle)) continue;
      cards.push({
        key: `place-${place.country}-${place.city}-${place.category}-${place.name}`,
        name: place.name,
        cityLine: `${place.city}, ${place.country}`,
        category: place.category,
        url: place.url,
        linkLabel: "Organiser page",
      });
    }
    for (const event of eventRecords) {
      if (category) continue;
      if (city && fold(event.region) !== fold(city.city)) continue;
      const haystack = `${event.region} ${event.when} ${event.summary}`;
      if (needle && !matchesText(haystack, needle)) continue;
      cards.push({
        key: `event-${event.region}-${event.when}`,
        name: event.summary,
        cityLine: event.region,
        category: "Event on file",
        when: event.when,
        url: event.url,
        linkLabel: event.urlLabel ?? "Organiser page",
        ticketsUrl: event.ticketsUrl,
      });
    }
    return cards;
  }, [filtering, placeRecords, eventRecords, category, city, needle]);

  function clearFilters() {
    setQuery("");
    setCategory("");
    setCity(null);
  }

  return (
    <section className="overflow-x-clip px-4 pb-6 pt-[4.5rem] sm:px-6 lg:px-8 lg:pt-[8.25rem]">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)] lg:items-end">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.32em] text-lagoon">Things to do</p>
          <h1 className="mt-2 font-display text-[2.7rem] leading-[0.9] tracking-tight text-ink sm:text-6xl">
            Detty <span className="italic text-oxide">December</span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted">
            Search the places and confirmed events already on file. Cities outside Lagos stay on the list.
          </p>
          <form
            role="search"
            className="mt-5 flex w-full min-w-0 flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              document.getElementById("results")?.scrollIntoView({ block: "start" });
            }}
          >
            <label htmlFor="activity-search" className="sr-only">
              Search places and events on file
            </label>
            <div className="w-full min-w-0 sm:flex-1">
              <input
                id="activity-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search places and events on file"
                autoComplete="off"
                className="ledger-input text-base"
              />
            </div>
            <button
              type="submit"
              className="w-full shrink-0 bg-lagoon px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-chart sm:w-auto"
            >
              Search
            </button>
          </form>
          <div
            role="radiogroup"
            aria-label="Category"
            className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          >
            <button
              type="button"
              role="radio"
              aria-checked={category === ""}
              className="chip"
              onClick={() => setCategory("")}
            >
              All categories
            </button>
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={category === name}
                className="chip"
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <p className="mt-4 max-w-xl text-[11px] leading-5 text-muted">{disclaimer}</p>
        </div>
        <LandmarkFrame />
      </div>

      <div id="results" className="mx-auto mt-8 max-w-6xl scroll-mt-36">
        {places.status === "loading" || events.status === "loading" ? (
          <LoadingLines label="Loading places and events" />
        ) : null}
        {places.status === "error" ? (
          <ErrorNote message="Places did not load." onRetry={places.retry} />
        ) : null}
        {events.status === "error" ? (
          <ErrorNote message="Events did not load." onRetry={events.retry} />
        ) : null}
        {!filtering ? (
          <p className="max-w-2xl text-sm leading-7 text-muted">
            Matches stay in the order already on file. Choose a category or a city, or type a name.
          </p>
        ) : null}
        {filtering ? (
          <div aria-live="polite">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl tracking-tight md:text-4xl">Matches on file</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-oxide"
              >
                Clear
              </button>
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
              {activities.length} {activities.length === 1 ? "match" : "matches"}
            </p>
            {activities.length === 0 &&
            places.status !== "loading" &&
            events.status !== "loading" ? (
              <div className="mt-4">
                <EmptyNote>Nothing on file matches this search.</EmptyNote>
              </div>
            ) : null}
            {activities.length > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {activities.map((activity) => (
                  <ActivityCard key={activity.key} activity={activity} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mx-auto mt-10 min-w-0 max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Cities</p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
              Where places are on file
            </h2>
          </div>
          <a href="/places" className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide">
            All places →
          </a>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Each city narrows the matches to organiser pages already filed there.
        </p>
        {places.status === "ready" && cities.length === 0 ? (
          <EmptyNote>No places are on file.</EmptyNote>
        ) : null}
        {cities.length > 0 ? (
          <div className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
            {cities.map((entry) => {
              const selected = city?.city === entry.city && city.country === entry.country;
              return (
                <button
                  key={`${entry.country}-${entry.city}`}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setCity(selected ? null : entry);
                    document.getElementById("results")?.scrollIntoView({ block: "start" });
                  }}
                  className={`w-40 shrink-0 border px-3 py-3 text-left ${
                    selected ? "border-lagoon bg-chart" : "border-ink/15 bg-chart"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-gold">{entry.country}</p>
                  <p className="mt-2 font-display text-2xl leading-none">{entry.city}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                    {entry.count} {entry.count === 1 ? "place" : "places"}
                  </p>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
