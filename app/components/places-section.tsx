"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Place } from "../places";
import { SectionIntro, sectionClass } from "./section-intro";
import { EmptyNote, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

export function PlacesFallback() {
  return (
    <section id="places" className={sectionClass}>
      <SectionIntro
        kicker="Places"
        title="Organiser pages"
        lede="Each name opens that organiser page. Cities outside Lagos stay on the list."
      />
      <LoadingLines label="Loading places" />
    </section>
  );
}

export function PlacesSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category")?.trim() ?? "";
  const [query, setQuery] = useState("");
  const all = useRecords<Place[]>("/api/places");
  const listUrl = category
    ? `/api/places?category=${encodeURIComponent(category)}`
    : "/api/places";
  const listed = useRecords<Place[]>(listUrl);

  const categories = useMemo(() => {
    if (all.status !== "ready") return [];
    const names: string[] = [];
    for (const place of all.data) {
      if (!names.includes(place.category)) names.push(place.category);
    }
    return names;
  }, [all]);

  function choose(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("category", next);
    else params.delete("category");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `/?${nextQuery}` : "/", { scroll: false });
  }

  const needle = query.trim().toLowerCase();
  const source = category ? listed : all;
  const visible = source.status === "ready" ? source.data : [];
  const shown = needle
    ? visible.filter((place) =>
        `${place.name} ${place.city} ${place.country}`
          .toLowerCase()
          .includes(needle),
      )
    : visible;

  const groups =
    source.status === "ready"
      ? shown.reduce<
          { country: string; cities: { city: string; places: Place[] }[] }[]
        >((countries, place) => {
          let country = countries.find((item) => item.country === place.country);
          if (!country) {
            country = { country: place.country, cities: [] };
            countries.push(country);
          }
          let city = country.cities.find((item) => item.city === place.city);
          if (!city) {
            city = { city: place.city, places: [] };
            country.cities.push(city);
          }
          city.places.push(place);
          return countries;
        }, [])
      : [];

  return (
    <section id="places" className={`${sectionClass} border-t border-line`}>
      <SectionIntro
        kicker="Places"
        title="Organiser pages"
        lede="Each name opens that organiser page. Categories come from the file. Cities outside Lagos stay on the list."
      />

      {all.status === "loading" ? <LoadingLines label="Loading places" /> : null}
      {all.status === "error" ? (
        <ErrorNote
          message="Places did not load. The directory is still the one on this site."
          onRetry={all.retry}
        />
      ) : null}

      {all.status === "ready" ? (
        <div>
          <div
            role="radiogroup"
            aria-label="Category"
            className="-mx-5 flex w-full min-w-0 gap-2 overflow-x-auto px-5 pb-3 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            <button
              type="button"
              role="radio"
              aria-checked={category === ""}
              className="chip"
              onClick={() => choose("")}
            >
              All
            </button>
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={category.toLowerCase() === name.toLowerCase()}
                className="chip"
                onClick={() => choose(name)}
              >
                {name}
              </button>
            ))}
          </div>

          <label className="mt-4 block max-w-sm">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Name or city
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Narrow the list"
              className="ledger-input mt-2"
            />
          </label>

          <div className="mt-6" aria-live="polite">
            {source.status === "loading" ? (
              <LoadingLines label="Loading places" />
            ) : null}
            {source.status === "error" ? (
              <ErrorNote
                message="That category did not load."
                onRetry={source.retry}
              />
            ) : null}
            {source.status === "ready" && visible.length === 0 ? (
              <EmptyNote>
                {category
                  ? `No places are on file for ${category}.`
                  : "No places are on file."}
              </EmptyNote>
            ) : null}
            {source.status === "ready" && visible.length > 0 && shown.length === 0 ? (
              <EmptyNote>No filed place matches {query.trim()}.</EmptyNote>
            ) : null}
            {source.status === "ready" && shown.length > 0 ? (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
                  {shown.length} {shown.length === 1 ? "place" : "places"}
                  {category ? ` in ${shown[0]?.category ?? category}` : ""}
                </p>
                {groups.map((country) => (
                  <div key={country.country} className="mt-8">
                    <h3 className="font-display text-3xl italic tracking-tight">
                      {country.country}
                    </h3>
                    {country.cities.map((city) => (
                      <div key={city.city} className="mt-4">
                        <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                          {city.city}
                        </h4>
                        <ul className="mt-1">
                          {city.places.map((place) => (
                            <li
                              key={`${place.country}-${place.city}-${place.category}-${place.name}`}
                              className="grid gap-1 border-t border-line py-3 sm:grid-cols-[minmax(0,1.5fr)_auto] sm:items-baseline sm:gap-6"
                            >
                              <a
                                href={place.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${place.name}, organiser page`}
                                className="text-lg leading-7 text-ink underline decoration-oxide/50 decoration-1 underline-offset-4"
                              >
                                {place.name}
                              </a>
                              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brass">
                                {place.category}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
