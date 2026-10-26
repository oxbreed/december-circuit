"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isMajorEvent, majorEventsFrom } from "../event-major";
import { eventKind, kindsPresentIn, type EventKind } from "../event-kind";
import type { CircuitEvent } from "../events";
import { eventDateSpan } from "../event-dates";
import {
  lagosYmd,
  laterInDecember,
  parseIsoYmd,
  rangesOverlap,
  weekWindowForDay,
  weekWindows,
  type WeekWindow,
} from "../week";
import { DateBlock, EventCard } from "./event-card";
import { presentEvent } from "../event-view";
import { eventTripId } from "../trip";
import { SaveTripButton } from "./save-trip-button";
import { LoadMoreBar, useListPageSize } from "./load-more";
import { EmptyList, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

type ViewMode = "week" | "city" | "list";
type RangeChip = "this-week" | "next-week" | "later" | "";

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function eventKey(event: CircuitEvent) {
  return `${event.region}\n${event.when}\n${event.summary}`;
}

function spanFor(event: CircuitEvent) {
  return eventDateSpan(event.when);
}

function defaultView(now: Date): ViewMode {
  return lagosYmd(now).m === 12 ? "week" : "list";
}

function parseView(value: string | null, now: Date): ViewMode {
  if (value === "week" || value === "city" || value === "list") return value;
  return defaultView(now);
}

function parseRange(value: string | null): RangeChip {
  if (value === "this-week" || value === "next-week" || value === "later") {
    return value;
  }
  return "";
}

function parseCities(search: URLSearchParams) {
  return uniqueSorted(
    search
      .getAll("city")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function MajorCard({ event }: { event: CircuitEvent }) {
  const view = presentEvent(event);

  return (
    <article className="flex flex-col border border-ink/15 bg-chart shadow-[4px_4px_0_0_rgba(184,67,47,0.16)]">
      <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
        <DateBlock when={event.when} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
            {view.category}
          </p>
          <h3 className="mt-2 font-display text-3xl leading-none tracking-tight sm:text-4xl md:text-5xl">
            <Link href={view.href} className="hover:text-oxide">
              {view.name}
            </Link>
          </h3>
          <p className="mt-3 text-sm text-ink">{view.region}</p>
          {view.venue ? <p className="mt-1 text-sm text-muted">{view.venue}</p> : null}
          {view.note ? (
            <p className="mt-3 text-sm leading-7 text-muted">{view.note}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col items-start gap-4 border-t border-ink/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {event.ticketsUrl || event.url ? (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {event.ticketsUrl ? (
              <a
                href={event.ticketsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-oxide px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-chart"
              >
                Tickets — leaves this site
              </a>
            ) : null}
            {event.url ? (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {event.urlLabel ?? "Organiser page"} — leaves this site
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-sm leading-7 text-muted">No organiser page listed</p>
        )}
        <SaveTripButton kind="event" id={eventTripId(event)} />
      </div>
    </article>
  );
}

function GroupHeading({ children }: { children: string }) {
  return (
    <h3 className="font-display text-3xl italic tracking-tight text-gold md:text-4xl">
      {children}
    </h3>
  );
}

export function EventsDirectory() {
  const eventsState = useRecords<CircuitEvent[]>("/api/events");
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [now] = useState(() => new Date());
  const pageSize = useListPageSize(6, 12);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const citiesSelected = parseCities(search);
  const range = parseRange(search.get("range"));
  const category = (search.get("category") ?? "") as EventKind | "";
  const view = parseView(search.get("view"), now);

  const records = eventsState.status === "ready" ? eventsState.data : [];
  const cityOptions = useMemo(
    () => uniqueSorted(records.map((event) => event.region)),
    [records],
  );
  const categoryOptions = useMemo(() => kindsPresentIn(records), [records]);

  const windows = useMemo(() => {
    const { thisWeek, nextWeek } = weekWindows(now);
    return {
      thisWeek,
      nextWeek,
      later: laterInDecember(now),
    };
  }, [now]);

  function replaceParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(search.toString());
    mutate(next);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function toggleCity(city: string) {
    replaceParams((next) => {
      const current = parseCities(next);
      const on = current.includes(city);
      next.delete("city");
      for (const value of on ? current.filter((c) => c !== city) : [...current, city]) {
        next.append("city", value);
      }
    });
    setVisibleCount(pageSize);
  }

  function setRange(value: RangeChip) {
    replaceParams((next) => {
      if (value) next.set("range", value);
      else next.delete("range");
    });
    setVisibleCount(pageSize);
  }

  function setCategory(value: EventKind | "") {
    replaceParams((next) => {
      if (value) next.set("category", value);
      else next.delete("category");
    });
    setVisibleCount(pageSize);
  }

  function setView(value: ViewMode) {
    replaceParams((next) => {
      if (value === defaultView(now)) next.delete("view");
      else next.set("view", value);
    });
  }

  function clearFilters() {
    replaceParams((next) => {
      next.delete("city");
      next.delete("range");
      next.delete("category");
    });
    setVisibleCount(pageSize);
  }

  const filtersOn = citiesSelected.length > 0 || range !== "" || category !== "";

  const matched = useMemo(() => {
    return records.filter((event) => {
      if (citiesSelected.length > 0 && !citiesSelected.includes(event.region)) {
        return false;
      }
      if (category) {
        if (eventKind(event) !== category) return false;
      }
      if (range) {
        const span = spanFor(event);
        if (!span) return false;
        const window =
          range === "this-week"
            ? windows.thisWeek
            : range === "next-week"
              ? windows.nextWeek
              : windows.later;
        if (!rangesOverlap(span.start, span.end, window.start, window.end)) {
          return false;
        }
      }
      return true;
    });
  }, [records, citiesSelected, category, range, windows]);

  const majors = useMemo(() => {
    const allMajors = majorEventsFrom(records);
    return matched.filter((event) => isMajorEvent(event, allMajors));
  }, [matched, records]);

  const majorKeys = useMemo(() => new Set(majors.map(eventKey)), [majors]);

  const smaller = useMemo(() => {
    return matched
      .filter((event) => !majorKeys.has(eventKey(event)))
      .map((event, index) => ({ event, index, span: spanFor(event) }))
      .sort((a, b) => {
        const aStart = a.span?.start ?? "9999";
        const bStart = b.span?.start ?? "9999";
        return aStart.localeCompare(bStart) || a.index - b.index;
      })
      .map((row) => row.event);
  }, [matched, majorKeys]);

  const pageRows = smaller.slice(0, visibleCount);
  const hasMore = smaller.length > visibleCount;

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [citiesSelected.join("|"), range, category, pageSize]);

  const weekGroups = useMemo(() => {
    const groups = new Map<string, { window: WeekWindow; events: CircuitEvent[] }>();
    for (const event of pageRows) {
      const span = spanFor(event);
      if (!span) {
        const key = "Dates on file";
        const existing = groups.get(key);
        if (existing) existing.events.push(event);
        else {
          groups.set(key, {
            window: { label: key, start: "", end: "", title: key },
            events: [event],
          });
        }
        continue;
      }
      const day = parseIsoYmd(span.start);
      if (!day) continue;
      const window = weekWindowForDay(day);
      const existing = groups.get(window.start);
      if (existing) existing.events.push(event);
      else groups.set(window.start, { window, events: [event] });
    }
    return [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, group]) => group);
  }, [pageRows]);

  const cityGroups = useMemo(() => {
    const order = uniqueSorted(pageRows.map((event) => event.region));
    return order.map((region) => ({
      region,
      events: pageRows.filter((event) => event.region === region),
    }));
  }, [pageRows]);

  return (
    <div>
      <section className="mx-auto w-full max-w-6xl px-5 pt-8 md:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">
          dirtydecember.info
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-none tracking-tight md:text-6xl">
          Confirmed events
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Confirmed events on file for Lagos, Calabar, Ghana, and other regions
          listed — parties, festivals, and season dates from organiser pages or
          named reports. Tickets leave this site. Dates use Africa/Lagos.
        </p>
        <p className="mt-5">
          <Link
            href="/list"
            className="inline-flex bg-oxide px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-chart"
          >
            List an event
          </Link>
        </p>
      </section>

      <div
        className="sticky z-30 mt-8 border-y border-ink/10 bg-paper/95 backdrop-blur-md"
        style={{ top: "calc(var(--clock-strip, 2.75rem) + 3.35rem)" }}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-4 md:px-8">
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted">
                City
              </p>
              <div className="chip-row flex gap-2 overflow-x-auto pb-1">
                {cityOptions.length === 0 ? (
                  <span className="text-sm text-muted">Cities load with the list.</span>
                ) : (
                  cityOptions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      className="chip"
                      aria-checked={citiesSelected.includes(city)}
                      onClick={() => toggleCity(city)}
                    >
                      {city}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted">
                Date
              </p>
              <div className="chip-row flex gap-2 overflow-x-auto pb-1">
                {(
                  [
                    ["this-week", "This week"],
                    ["next-week", "Next week"],
                    ["later", "Later in December"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className="chip"
                    aria-checked={range === value}
                    onClick={() => setRange(range === value ? "" : value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {categoryOptions.length > 0 ? (
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted">
                  Category
                </p>
                <div className="chip-row flex gap-2 overflow-x-auto pb-1">
                  {categoryOptions.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      className="chip"
                      aria-checked={category === kind}
                      onClick={() => setCategory(category === kind ? "" : kind)}
                    >
                      {kind}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              {filtersOn ? (
                <button type="button" className="chip" onClick={clearFilters}>
                  Clear filters
                </button>
              ) : null}
              <Link
                href="/list"
                className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                List an event
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section
        id="events"
        className="mx-auto w-full max-w-6xl scroll-mt-36 px-5 py-10 md:px-8 md:pb-20"
      >
        <div
          className="mb-8 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="View"
        >
          <p className="mr-2 text-[10px] uppercase tracking-[0.2em] text-muted">
            View
          </p>
          {(
            [
              ["week", "By week"],
              ["city", "By city"],
              ["list", "All list"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-checked={view === value}
              onClick={() => setView(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {eventsState.status === "loading" ? <LoadingLines label="Loading events" /> : null}
        {eventsState.status === "error" ? (
          <ErrorNote
            message="The event list did not load. The crawlable index above still lists what is on file."
            onRetry={eventsState.retry}
          />
        ) : null}

        {eventsState.status === "ready" ? (
          <div className="events-directory-results">
            {matched.length === 0 ? (
              <EmptyList href="/list" cta="List an event">
                {filtersOn
                  ? "No confirmed event matches these filters. Try clearing city, date, or category."
                  : "No December 2026 events are listed yet."}
              </EmptyList>
            ) : (
              <>
                {majors.length > 0 ? (
                  <div className="mb-12">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                      Major events
                    </p>
                    <div className="mt-4 grid gap-5">
                      {majors.map((event) => (
                        <MajorCard
                          key={eventKey(event)}
                          event={event}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {pageRows.length > 0 ? (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
                      {smaller.length} more on file
                      {filtersOn ? " matching filters" : ""}
                    </p>

                    {view === "week" ? (
                      <div className="mt-6 space-y-10">
                        {weekGroups.map((group) => (
                          <div key={group.window.start || group.window.title}>
                            <GroupHeading>{group.window.title}</GroupHeading>
                            <div className="mt-4 grid gap-4">
                              {group.events.map((event) => (
                                <EventCard
                                  key={eventKey(event)}
                                  event={event}
                                  as="h4"
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {view === "city" ? (
                      <div className="mt-6 space-y-10">
                        {cityGroups.map((group) => (
                          <div key={group.region}>
                            <GroupHeading>{group.region}</GroupHeading>
                            <div className="mt-4 grid gap-4">
                              {group.events.map((event) => (
                                <EventCard
                                  key={eventKey(event)}
                                  event={event}
                                  as="h4"
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {view === "list" ? (
                      <div className="mt-4 grid gap-4">
                        {pageRows.map((event) => (
                          <EventCard
                            key={eventKey(event)}
                            event={event}
                            as="h3"
                          />
                        ))}
                      </div>
                    ) : null}

                    <LoadMoreBar
                      shown={visibleCount}
                      total={smaller.length}
                      hasMore={hasMore}
                      noun={
                        majors.length > 0
                          ? `· ${majors.length} major${majors.length === 1 ? "" : "s"} above`
                          : "on file"
                      }
                      onMore={() => setVisibleCount((count) => count + pageSize)}
                    />
                  </div>
                ) : majors.length > 0 ? (
                  <p className="text-sm leading-7 text-muted">
                    Only major confirmed events match these filters.
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        <p className="mt-12 max-w-2xl border-t border-ink/10 pt-8 text-sm leading-7 text-muted">
          Organiser booking links leave dirtydecember.info.{" "}
          <Link
            href="/list"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            List an event or place
          </Link>{" "}
          for review — unpublished until checked.
        </p>
      </section>

    </div>
  );
}
