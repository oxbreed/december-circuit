import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { events, type CircuitEvent } from "../events";
import { presentEvent } from "../event-view";
import { datesOnFile } from "../jsonld";
import { lagosYmd, toIso } from "../week";
import { LoadingLines } from "./states";

function spanFor(event: CircuitEvent) {
  const dates = datesOnFile(event.when);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dates.startDate)) return null;
  const end =
    dates.endDate && /^\d{4}-\d{2}-\d{2}$/.test(dates.endDate)
      ? dates.endDate
      : dates.startDate;
  return { start: dates.startDate, end };
}

function upcomingFrom(now: Date, limit: number): CircuitEvent[] {
  const today = toIso(lagosYmd(now));
  return events
    .map((event, index) => {
      const span = spanFor(event);
      return span ? { event, span, index } : null;
    })
    .filter((row): row is NonNullable<typeof row> => row !== null && row.span.end >= today)
    .sort(
      (a, b) =>
        a.span.start.localeCompare(b.span.start) ||
        a.span.end.localeCompare(b.span.end) ||
        a.index - b.index,
    )
    .slice(0, limit)
    .map((row) => row.event);
}

async function UpcomingBody() {
  await connection();
  const rows = upcomingFrom(new Date(), 7);

  if (rows.length === 0) {
    return (
      <p className="mt-6 max-w-2xl text-sm leading-7 text-muted">
        Nothing on the sourced list falls on or after today in Africa/Lagos.{" "}
        <a
          href="/list"
          className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
        >
          List an event
        </a>{" "}
        for review.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
      {rows.map((event) => {
        const view = presentEvent(event);
        return (
          <li
            key={`${event.region}-${event.when}-${event.summary}`}
            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <div className="min-w-0">
              <Link
                href={view.href}
                className="font-display text-2xl leading-tight tracking-tight hover:text-oxide"
              >
                {view.name}
              </Link>
              <p className="mt-1 text-sm text-ink">{view.region}</p>
            </div>
            <p className="shrink-0 text-sm text-muted sm:text-right">{event.when}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function UpcomingHome() {
  return (
    <section id="upcoming" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">
              Africa/Lagos
            </p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
              This week / Upcoming
            </h2>
          </div>
          <Link
            href="/events"
            className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide"
          >
            All confirmed events →
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Next dates from the sourced list, ordered by start day. Past nights drop off automatically.
        </p>
        <Suspense fallback={<div className="mt-6"><LoadingLines /></div>}>
          <UpcomingBody />
        </Suspense>
      </div>
    </section>
  );
}
