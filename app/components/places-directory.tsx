"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Place } from "../places";
import { placeTripId } from "../trip";
import { SaveTripButton } from "./save-trip-button";
import { LoadMoreBar, useListPageSize } from "./load-more";
import { EmptyList, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

/** Hub cities shown first in the city browse row. */
const HUB_CITIES = ["Lagos", "Accra", "Calabar", "Abuja", "Kumasi"] as const;

type ShortcutId = "lagos" | "accra" | "nightlife" | "stay";

const SHORTCUTS: {
  id: ShortcutId;
  label: string;
  city?: string;
  categories?: string[];
}[] = [
  { id: "lagos", label: "Popular in Lagos", city: "Lagos" },
  { id: "accra", label: "Popular in Accra", city: "Accra" },
  {
    id: "nightlife",
    label: "Clubs & nightlife",
    categories: ["Clubs", "Bars"],
  },
  {
    id: "stay",
    label: "Hotels & short-stay",
    categories: ["Hotels", "Short-stay"],
  },
];

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function placeKey(place: Place) {
  return `${place.country}\n${place.city}\n${place.category}\n${place.name}`;
}

function parseCategories(search: URLSearchParams) {
  return uniqueSorted(
    search
      .getAll("category")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function activeShortcut(city: string, categories: string[]): ShortcutId | null {
  for (const shortcut of SHORTCUTS) {
    const cityMatch = (shortcut.city ?? "") === city;
    const cats = shortcut.categories ?? [];
    const catMatch =
      cats.length === 0
        ? categories.length === 0
        : cats.length === categories.length &&
          cats.every((name) => categories.includes(name));
    if (shortcut.city && shortcut.categories) {
      if (cityMatch && catMatch) return shortcut.id;
    } else if (shortcut.city) {
      if (cityMatch && categories.length === 0) return shortcut.id;
    } else if (shortcut.categories) {
      if (!city && catMatch) return shortcut.id;
    }
  }
  return null;
}

function PlaceCard({ place }: { place: Place }) {
  return (
    <article className="flex flex-col border border-ink/15 bg-chart shadow-[4px_4px_0_0_rgba(138,98,50,0.14)]">
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-lagoon">
            {place.city}
          </span>
          <span className="text-muted/50" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brass">
            {place.category}
          </span>
        </div>
        <h3 className="font-display text-2xl leading-none tracking-tight md:text-3xl">
          <a
            href={place.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-oxide"
            aria-label={`${place.name}, opens their own page`}
          >
            {place.name}
          </a>
        </h3>
        <p className="text-sm leading-6 text-muted">
          {place.country}
          <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-oxide">
            Opens their page — leaves this site
          </span>
        </p>
      </div>
      <div className="flex flex-col items-start gap-3 border-t border-ink/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={place.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
        >
          Organiser page
        </a>
        <SaveTripButton kind="place" id={placeTripId(place)} />
      </div>
    </article>
  );
}

export function PlacesDirectory() {
  const placesState = useRecords<Place[]>("/api/places");
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageSize = useListPageSize(6, 12);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [nameQuery, setNameQuery] = useState("");

  const city = search.get("city")?.trim() ?? "";
  const country = search.get("country")?.trim() ?? "";
  const categories = parseCategories(search);
  const shortcutOn = activeShortcut(city, categories);

  const records = placesState.status === "ready" ? placesState.data : [];

  const categoryOptions = useMemo(
    () => uniqueSorted(records.map((place) => place.category)),
    [records],
  );

  const countryOptions = useMemo(
    () => uniqueSorted(records.map((place) => place.country)),
    [records],
  );

  const cityOptions = useMemo(() => {
    const scoped = country
      ? records.filter((place) => place.country.toLowerCase() === country.toLowerCase())
      : records;
    const all = uniqueSorted(scoped.map((place) => place.city));
    const hubs = HUB_CITIES.filter((name) => all.includes(name));
    const rest = all.filter((name) => !hubs.includes(name as (typeof HUB_CITIES)[number]));
    return [...hubs, ...rest];
  }, [records, country]);

  function replaceParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(search.toString());
    mutate(next);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function setCity(value: string) {
    replaceParams((next) => {
      if (value) next.set("city", value);
      else next.delete("city");
    });
    setVisibleCount(pageSize);
  }

  function setCountry(value: string) {
    replaceParams((next) => {
      if (value) next.set("country", value);
      else next.delete("country");
      // City may not belong to the new country — drop it.
      next.delete("city");
    });
    setVisibleCount(pageSize);
  }

  function setCategory(value: string) {
    replaceParams((next) => {
      next.delete("category");
      if (value) next.append("category", value);
    });
    setVisibleCount(pageSize);
  }

  function applyShortcut(id: ShortcutId) {
    const shortcut = SHORTCUTS.find((item) => item.id === id);
    if (!shortcut) return;
    replaceParams((next) => {
      next.delete("city");
      next.delete("country");
      next.delete("category");
      if (shortcut.city) next.set("city", shortcut.city);
      for (const name of shortcut.categories ?? []) {
        next.append("category", name);
      }
    });
    setVisibleCount(pageSize);
  }

  function clearFilters() {
    replaceParams((next) => {
      next.delete("city");
      next.delete("country");
      next.delete("category");
    });
    setNameQuery("");
    setVisibleCount(pageSize);
  }

  const filtersOn =
    Boolean(city) || Boolean(country) || categories.length > 0 || nameQuery.trim().length > 0;

  const matched = useMemo(() => {
    const needle = nameQuery.trim().toLowerCase();
    return records.filter((place) => {
      if (country && place.country.toLowerCase() !== country.toLowerCase()) return false;
      if (city && place.city.toLowerCase() !== city.toLowerCase()) return false;
      if (categories.length > 0 && !categories.includes(place.category)) return false;
      if (
        needle &&
        !`${place.name} ${place.city} ${place.country} ${place.category}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [records, country, city, categories, nameQuery]);

  const pageRows = matched.slice(0, visibleCount);
  const hasMore = matched.length > visibleCount;

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [country, city, categories.join("|"), pageSize]);

  return (
    <div>
      <section className="mx-auto w-full max-w-6xl px-5 pt-8 md:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">
          dirtydecember.info
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-none tracking-tight md:text-6xl">
          Places & organiser pages
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Sourced organiser and business pages across West Africa — Lagos, Accra,
          Calabar, and cities on file. Browse by category or city, then open their
          own site. Booking leaves dirtydecember.info; no payment here.
        </p>
        <p className="mt-5">
          <Link
            href="/list#submit-place"
            className="inline-flex bg-oxide px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-chart"
          >
            List a place
          </Link>
        </p>
      </section>

      <section
        aria-label="Browse places"
        className="mx-auto mt-10 w-full max-w-6xl space-y-8 px-5 md:px-8"
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">
            Browse by category
          </p>
          <div
            role="radiogroup"
            aria-label="Category"
            className="chip-row -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            <button
              type="button"
              role="radio"
              aria-checked={categories.length === 0}
              className="chip"
              onClick={() => setCategory("")}
            >
              All categories
            </button>
            {categoryOptions.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={categories.length === 1 && categories[0] === name}
                className="chip"
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">
            Browse by country
          </p>
          <div
            role="radiogroup"
            aria-label="Country"
            className="chip-row -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            <button
              type="button"
              role="radio"
              aria-checked={country === ""}
              className="chip"
              onClick={() => setCountry("")}
            >
              All countries
            </button>
            {countryOptions.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={country.toLowerCase() === name.toLowerCase()}
                className="chip"
                onClick={() => setCountry(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">
            Browse by city
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Start with a Detty December hub, or pick any city already on file
            {country ? ` in ${country}` : ""}.
          </p>
          <div
            role="radiogroup"
            aria-label="City"
            className="chip-row -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            <button
              type="button"
              role="radio"
              aria-checked={city === ""}
              className="chip places-city-chip"
              onClick={() => setCity("")}
            >
              All cities
            </button>
            {cityOptions.map((name) => {
              const hub = (HUB_CITIES as readonly string[]).includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={city.toLowerCase() === name.toLowerCase()}
                  className={`chip places-city-chip${hub ? " places-city-chip--hub" : ""}`}
                  onClick={() => setCity(name)}
                >
                  {name}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-muted">
            <Link
              href="/cities"
              className="text-oxide underline decoration-oxide/40 underline-offset-4"
            >
              All cities →
            </Link>
            {" · "}
            <Link
              href="/west-africa"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              West Africa hub
            </Link>
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">
            Curated shortcuts
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SHORTCUTS.map((shortcut) => {
              const on = shortcutOn === shortcut.id;
              return (
                <li key={shortcut.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => applyShortcut(shortcut.id)}
                    className={`w-full border px-4 py-4 text-left transition-colors ${
                      on
                        ? "border-lagoon bg-lagoon text-chart"
                        : "border-ink/15 bg-chart hover:border-oxide hover:text-oxide"
                    }`}
                  >
                    <span className="block font-display text-xl leading-none tracking-tight">
                      {shortcut.label}
                    </span>
                    <span
                      className={`mt-2 block text-[11px] uppercase tracking-[0.14em] ${
                        on ? "text-chart/80" : "text-muted"
                      }`}
                    >
                      Places on file
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <label className="block max-w-sm flex-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Name
            </span>
            <input
              type="search"
              value={nameQuery}
              onChange={(event) => {
                setNameQuery(event.target.value);
                setVisibleCount(pageSize);
              }}
              placeholder="Narrow by name"
              className="ledger-input mt-2"
              autoComplete="off"
            />
          </label>
          {filtersOn ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] uppercase tracking-[0.16em] text-oxide underline decoration-oxide/40 underline-offset-4"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      <section
        aria-label="Place listings"
        className="places-directory-results mx-auto mt-10 w-full max-w-6xl px-5 pb-16 md:px-8 md:pb-20"
      >
        {placesState.status === "loading" ? (
          <LoadingLines label="Loading places" />
        ) : null}
        {placesState.status === "error" ? (
          <ErrorNote
            message="The place list did not load. The directory is still the one on this site."
            onRetry={placesState.retry}
          />
        ) : null}

        {placesState.status === "ready" ? (
          <div>
            {matched.length === 0 ? (
              <EmptyList href="/list#submit-place" cta="List a place">
                Nothing matches this browse. Clear filters or try another city or category.
              </EmptyList>
            ) : (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
                  {matched.length} {matched.length === 1 ? "place" : "places"} on file
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {pageRows.map((place) => (
                    <PlaceCard key={placeKey(place)} place={place} />
                  ))}
                </div>
                <LoadMoreBar
                  shown={visibleCount}
                  total={matched.length}
                  hasMore={hasMore}
                  onMore={() => setVisibleCount((count) => count + pageSize)}
                />
              </>
            )}
          </div>
        ) : null}

        <p className="mt-12 max-w-2xl border-t border-ink/10 pt-8 text-sm leading-7 text-muted">
          For unreviewed map points, try{" "}
          <Link
            href="/explore"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            Explore map search
          </Link>
          . Organiser booking links leave dirtydecember.info.
        </p>
      </section>
    </div>
  );
}
