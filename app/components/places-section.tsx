"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Place } from "../places";
import { placeTripId } from "../trip";
import { SaveTripButton } from "./save-trip-button";
import { SectionIntro, sectionClass } from "./section-intro";
import { EmptyNote, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

export function PlacesFallback() {
  return (
    <section id="places" className={sectionClass}>
      <SectionIntro
        kicker="Places"
        title="Organiser pages"
        lede="Tap a name to open that business’s own page in a new tab. Cities outside Lagos stay on the list."
      />
      <LoadingLines label="Loading places" />
    </section>
  );
}

function unique(values: string[]) {
  const names: string[] = [];
  for (const value of values) {
    if (!names.includes(value)) names.push(value);
  }
  return names;
}

export function PlacesSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const country = searchParams.get("country")?.trim() ?? "";
  const city = searchParams.get("city")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const [query, setQuery] = useState("");
  const all = useRecords<Place[]>("/api/places");

  const listParams = new URLSearchParams();
  if (country) listParams.set("country", country);
  if (city) listParams.set("city", city);
  if (category) listParams.set("category", category);
  const queryString = listParams.toString();
  const listUrl = queryString ? `/api/places?${queryString}` : "/api/places";
  const listed = useRecords<Place[]>(listUrl);

  const countries = useMemo(
    () => (all.status === "ready" ? unique(all.data.map((place) => place.country)) : []),
    [all],
  );
  const cities = useMemo(() => {
    if (all.status !== "ready") return [];
    const scoped = country
      ? all.data.filter((place) => place.country.toLowerCase() === country.toLowerCase())
      : all.data;
    return unique(scoped.map((place) => place.city));
  }, [all, country]);
  const categories = useMemo(
    () => (all.status === "ready" ? unique(all.data.map((place) => place.category)) : []),
    [all],
  );

  function replaceQuery(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const nextQuery = params.toString();
    router.replace(nextQuery ? `/places?${nextQuery}` : "/places", { scroll: false });
  }

  const needle = query.trim().toLowerCase();
  const source = queryString ? listed : all;
  const visible = source.status === "ready" ? source.data : [];
  const shown = needle
    ? visible.filter((place) =>
        `${place.name} ${place.city} ${place.country}`.toLowerCase().includes(needle),
      )
    : visible;

  const groups =
    source.status === "ready"
      ? shown.reduce<
          { country: string; cities: { city: string; places: Place[] }[] }[]
        >((list, place) => {
          let countryGroup = list.find((item) => item.country === place.country);
          if (!countryGroup) {
            countryGroup = { country: place.country, cities: [] };
            list.push(countryGroup);
          }
          let cityGroup = countryGroup.cities.find((item) => item.city === place.city);
          if (!cityGroup) {
            cityGroup = { city: place.city, places: [] };
            countryGroup.cities.push(cityGroup);
          }
          cityGroup.places.push(place);
          return list;
        }, [])
      : [];

  return (
    <section id="places" className={sectionClass}>
      <SectionIntro
        kicker="Places"
        title="Organiser pages"
        lede="Tap a name to open that business’s own page in a new tab. Matches stay in the order they are listed. Choose a category or a city, or type a name."
      />
      <p className="mb-6 max-w-2xl text-sm leading-6 text-muted">
        Missing a stay or venue?{" "}
        <Link
          href="/list#submit-place"
          className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
        >
          List a place
        </Link>{" "}
        — it stays unpublished until a person checks it.
      </p>

      {all.status === "loading" ? <LoadingLines label="Loading places" /> : null}
      {all.status === "error" ? (
        <ErrorNote
          message="The place list did not load. The directory is still the one on this site."
          onRetry={all.retry}
        />
      ) : null}

      {all.status === "ready" ? (
        <div>
          <div
            role="radiogroup"
            aria-label="Country"
            className="-mx-5 flex w-full min-w-0 gap-2 overflow-x-auto px-5 pb-3 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            <button
              type="button"
              role="radio"
              aria-checked={country === ""}
              className="chip"
              onClick={() => replaceQuery({ country: "", city: "" })}
            >
              All countries
            </button>
            {countries.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={country.toLowerCase() === name.toLowerCase()}
                className="chip"
                onClick={() => replaceQuery({ country: name, city: "" })}
              >
                {name}
              </button>
            ))}
          </div>

          <label className="mt-4 block max-w-sm">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              City
            </span>
            <select
              value={city}
              onChange={(event) => replaceQuery({ city: event.target.value })}
              className="ledger-input mt-2"
            >
              <option value="">All cities</option>
              {cities.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <div
            role="radiogroup"
            aria-label="Category"
            className="-mx-5 mt-4 flex w-full min-w-0 gap-2 overflow-x-auto px-5 pb-3 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            <button
              type="button"
              role="radio"
              aria-checked={category === ""}
              className="chip"
              onClick={() => replaceQuery({ category: "" })}
            >
              All categories
            </button>
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={category.toLowerCase() === name.toLowerCase()}
                className="chip"
                onClick={() => replaceQuery({ category: name })}
              >
                {name}
              </button>
            ))}
          </div>

          <label className="mt-4 block max-w-sm">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Name
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
              <ErrorNote message="That filter did not load." onRetry={source.retry} />
            ) : null}
            {source.status === "ready" && visible.length === 0 ? (
              <EmptyNote>Nothing matches this search.</EmptyNote>
            ) : null}
            {source.status === "ready" && visible.length > 0 && shown.length === 0 ? (
              <EmptyNote>Nothing matches this search.</EmptyNote>
            ) : null}
            {source.status === "ready" && shown.length > 0 ? (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
                  {shown.length} {shown.length === 1 ? "place" : "places"}
                </p>
                {groups.map((countryGroup) => (
                  <div key={countryGroup.country} className="mt-8">
                    <h3 className="font-display text-3xl italic tracking-tight">
                      {countryGroup.country}
                    </h3>
                    {countryGroup.cities.map((cityGroup) => (
                      <div key={cityGroup.city} className="mt-4">
                        <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                          {cityGroup.city}
                        </h4>
                        <ul className="mt-1">
                          {cityGroup.places.map((place) => (
                            <li
                              key={`${place.country}-${place.city}-${place.category}-${place.name}`}
                              className="grid gap-1 border-t border-line py-3 sm:grid-cols-[minmax(0,1.5fr)_auto] sm:items-baseline sm:gap-6"
                            >
                              <a
                                href={place.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${place.name}, opens their own page`}
                                className="text-lg leading-7 text-ink underline decoration-oxide/50 decoration-1 underline-offset-4"
                              >
                                {place.name}
                                <span className="mt-1 block text-[11px] font-sans uppercase tracking-[0.14em] text-oxide no-underline">
                                  Opens their page — leaves this site
                                </span>
                              </a>
                              <div className="flex flex-col items-start gap-3 sm:items-end">
                                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brass">
                                  {place.category}
                                </span>
                                <SaveTripButton kind="place" id={placeTripId(place)} />
                              </div>
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
