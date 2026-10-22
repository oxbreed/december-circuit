"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { disclaimer } from "../brand";
import { eventCategory } from "../event-view";
import type { CircuitEvent } from "../events";
import type { Place } from "../places";
import { LandmarkFrame } from "./landmark-frame";
import { EventCard } from "./event-card";
import { SectionIntro } from "./section-intro";
import { EmptyNote, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function Discovery({ home = false }: { home?: boolean }) {
  const eventsState = useRecords<CircuitEvent[]>("/api/events");
  const placesState = useRecords<Place[]>("/api/places");
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activity = search.get("activity") ?? "";
  const city = search.get("city") ?? "";
  const date = search.get("date") ?? "";

  const placeRecords = placesState.status === "ready" ? placesState.data : [];
  const eventRecords = eventsState.status === "ready" ? eventsState.data : [];

  const categories = useMemo(
    () => uniqueSorted(placeRecords.map((place) => place.category)),
    [placeRecords],
  );
  const cities = useMemo(
    () => uniqueSorted(placeRecords.map((place) => place.city)),
    [placeRecords],
  );
  const dates = useMemo(() => {
    const list: string[] = [];
    for (const event of eventRecords) {
      if (!list.includes(event.when)) list.push(event.when);
    }
    return list;
  }, [eventRecords]);

  function setFilter(key: "activity" | "city" | "date", value: string) {
    const next = new URLSearchParams(search.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

  const loading =
    eventsState.status === "loading" || placesState.status === "loading";
  const failed = eventsState.status === "error" || placesState.status === "error";
  const ready = eventsState.status === "ready" && placesState.status === "ready";
  const browsingPlaces = activity !== "" && activity !== eventCategory;
  const filtersOn = Boolean(activity || city || date);

  const eventsMatched = eventRecords.filter((event) => {
    if (browsingPlaces) return false;
    if (city && event.region !== city) return false;
    if (date && event.when !== date) return false;
    return true;
  });

  const placesMatched = placeRecords.filter((place) => {
    if (!browsingPlaces || date) return false;
    if (place.category !== activity) return false;
    if (city && place.city !== city) return false;
    return true;
  });

  const noEventsOnFile = ready && eventRecords.length === 0;
  const noMatches =
    ready &&
    !noEventsOnFile &&
    eventsMatched.length === 0 &&
    placesMatched.length === 0;

  let emptyCopy = "Nothing on file matches.";
  if (browsingPlaces && date) {
    emptyCopy =
      "Dates on file belong to confirmed events. Organiser pages do not have a date.";
  } else if (browsingPlaces) {
    emptyCopy = "No organiser page matches this activity and city.";
  } else if (filtersOn) {
    emptyCopy = "No confirmed event matches this city and date.";
  }

  return (
    <div>
      {home ? (
        <section className="mx-auto grid max-w-6xl gap-8 px-5 pt-[4.5rem] pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-end lg:px-8 lg:pt-[8.25rem]">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">
              December 2026
            </p>
            <h1 className="mt-3 max-w-xl font-display text-5xl leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
              Find what is <span className="text-oxide">on file</span>.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted">
              {disclaimer}
            </p>
          </div>
          <LandmarkFrame />
        </section>
      ) : (
        <section className="mx-auto w-full max-w-6xl px-5 pt-28 md:px-8 md:pt-36">
          <SectionIntro
            kicker="Confirmed events"
            title="Find an event on file."
            lede="Activity, city, and date use only the lists already stored here."
          />
        </section>
      )}

      <section
        id="events"
        className="mx-auto w-full max-w-6xl scroll-mt-36 px-5 pb-16 md:px-8 md:pb-20"
      >
        {loading ? <LoadingLines label="Loading what is on file." /> : null}
        {failed ? (
          <ErrorNote
            message="The guide could not be loaded."
            onRetry={() => {
              eventsState.retry();
              placesState.retry();
            }}
          />
        ) : null}
        {ready ? (
          <>
            <form
              className="border border-ink/15 bg-chart p-4 shadow-[4px_4px_0_0_rgba(138,98,50,0.18)] sm:p-5"
              onSubmit={(event) => {
                event.preventDefault();
                document.getElementById("guide-results")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <label className="block min-w-0">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted">
                    Activity
                  </span>
                  <select
                    className="ledger-input ledger-select"
                    value={activity}
                    onChange={(event) => setFilter("activity", event.target.value)}
                  >
                    <option value="">All activities</option>
                    <option value={eventCategory}>{eventCategory}</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted">
                    City
                  </span>
                  <select
                    className="ledger-input ledger-select"
                    value={city}
                    onChange={(event) => setFilter("city", event.target.value)}
                  >
                    <option value="">All cities</option>
                    {cities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block min-w-0">
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted">
                    Date
                  </span>
                  <select
                    className="ledger-input ledger-select"
                    value={date}
                    onChange={(event) => setFilter("date", event.target.value)}
                  >
                    <option value="">All dates</option>
                    {dates.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                Dates are the confirmed events. Any other activity opens organiser pages in that category.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-chart"
                >
                  Find
                </button>
                {filtersOn ? (
                  <button type="button" onClick={clearFilters} className="chip">
                    Clear
                  </button>
                ) : null}
              </div>
            </form>

            <div id="guide-results" className="mt-8 scroll-mt-36">
              {noEventsOnFile ? (
                <EmptyNote>No December 2026 events are on file.</EmptyNote>
              ) : null}
              {noMatches ? <EmptyNote>{emptyCopy}</EmptyNote> : null}
              {eventsMatched.length > 0 ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                    {eventsMatched.length} confirmed{" "}
                    {eventsMatched.length === 1 ? "event" : "events"}
                  </p>
                  <div className="mt-4 grid gap-4">
                    {eventsMatched.map((event) => (
                      <EventCard
                        key={`${event.region}-${event.when}`}
                        event={event}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {placesMatched.length > 0 ? (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                    {placesMatched.length} organiser{" "}
                    {placesMatched.length === 1 ? "page" : "pages"}
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {placesMatched.map((place) => (
                      <article
                        key={`${place.city}-${place.name}`}
                        className="border border-ink/15 bg-chart p-5"
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                          {place.category}
                        </p>
                        <h2 className="mt-2 font-display text-3xl leading-none tracking-tight">
                          {place.name}
                        </h2>
                        <p className="mt-3 text-sm text-ink">{place.city}</p>
                        <a
                          href={place.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                        >
                          Organiser page — leaves this site
                        </a>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
