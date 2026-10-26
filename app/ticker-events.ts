import { eventDateSpan } from "./event-dates";
import { events, type CircuitEvent } from "./events";
import { presentEvent } from "./event-view";
import { lagosYmd, toIso } from "./week";

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
 * Next eight confirmed events by sourced start date (Africa/Lagos “today”
 * and later). Falls back to the soonest eight on file when the season has
 * not started yet or every night is in the past.
 */
export function nextEventsForTicker(limit = TICKER_EVENT_COUNT): CircuitEvent[] {
  const today = toIso(lagosYmd(new Date()));
  const dated = events
    .map((event) => ({ event, start: startIso(event) }))
    .filter((row): row is { event: CircuitEvent; start: string } => Boolean(row.start))
    .sort((a, b) => a.start.localeCompare(b.start) || a.event.summary.localeCompare(b.event.summary));

  const upcoming = dated.filter((row) => row.start >= today);
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
