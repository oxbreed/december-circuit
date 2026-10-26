import { eventDateSpan, seasonYear } from "./event-dates";
import { events, type CircuitEvent } from "./events";
import { presentEvent } from "./event-view";

export type TickerItem = {
  kind: "event" | "news";
  headline: string;
  source: string;
  link: string;
  published?: string;
  description?: string;
  image?: string;
};

const TICKER_EVENT_COUNT = 8;

function startIso(event: CircuitEvent) {
  return eventDateSpan(event.when)?.start ?? null;
}

/**
 * Next eight confirmed events by sourced start date.
 * Uses an optional `asOf` ISO day (YYYY-MM-DD). When omitted, floors at the
 * season’s first listed night so prerender never calls `new Date()`.
 */
export function nextEventsForTicker(
  limit = TICKER_EVENT_COUNT,
  asOf?: string,
): CircuitEvent[] {
  const dated = events
    .map((event) => ({ event, start: startIso(event) }))
    .filter((row): row is { event: CircuitEvent; start: string } => Boolean(row.start))
    .sort((a, b) => a.start.localeCompare(b.start) || a.event.summary.localeCompare(b.event.summary));

  const floor = asOf && /^\d{4}-\d{2}-\d{2}$/.test(asOf) ? asOf : `${seasonYear}-11-01`;
  const upcoming = dated.filter((row) => row.start >= floor);
  const pool = upcoming.length > 0 ? upcoming : dated;
  return pool.slice(0, limit).map((row) => row.event);
}

/** One copy of the next eight events for the home ticker (SSR + /api/news). */
export function eventTickerItems(): TickerItem[] {
  return nextEventsForTicker().map((event) => {
    const view = presentEvent(event);
    return {
      kind: "event" as const,
      headline: `${event.when}. ${event.summary}`,
      source: "Confirmed event",
      link: view.href,
      published: event.when,
    };
  });
}
