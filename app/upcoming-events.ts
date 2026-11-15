import { events, type CircuitEvent } from "./events";
import { datesOnFile } from "./jsonld";
import { lagosYmd, toIso } from "./week";

function spanFor(event: CircuitEvent) {
  const dates = datesOnFile(event.when);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dates.startDate)) return null;
  const end = dates.endDate && /^\d{4}-\d{2}-\d{2}$/.test(dates.endDate) ? dates.endDate : dates.startDate;
  return { start: dates.startDate, end };
}

export function upcomingEventsFrom(now: Date): CircuitEvent[] {
  const today = toIso(lagosYmd(now));
  return events
    .map((event, index) => {
      const span = spanFor(event);
      return span ? { event, span, index } : null;
    })
    .filter((row): row is NonNullable<typeof row> => row !== null && row.span.end >= today)
    .sort((a, b) => a.span.start.localeCompare(b.span.start) || a.span.end.localeCompare(b.span.end) || a.index - b.index)
    .map((row) => row.event);
}
