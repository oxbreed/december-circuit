import Link from "next/link";
import { eventDateSpan, fullEventDateLabel } from "../event-dates";
import { eventSlug, presentEvent } from "../event-view";
import type { CircuitEvent } from "../events";

export function sortByStart(list: CircuitEvent[]) {
  return [...list].sort((a, b) => {
    const sa = eventDateSpan(a.when)?.start ?? "9999";
    const sb = eventDateSpan(b.when)?.start ?? "9999";
    return sa === sb
      ? presentEvent(a).name.localeCompare(presentEvent(b).name)
      : sa.localeCompare(sb);
  });
}

/** Plain server-rendered list: every row is a real link, so crawlers see all of it. */
export function EventDateList({ list }: { list: CircuitEvent[] }) {
  return (
    <ul className="divide-y divide-ink/10 border border-ink/15 bg-chart">
      {sortByStart(list).map((event) => {
        const view = presentEvent(event);
        return (
          <li
            key={`${eventSlug(event)}`}
            className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:px-5"
          >
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                {view.region} · {view.category}
              </p>
              <Link
                href={view.href}
                className="mt-1 block font-display text-2xl leading-tight tracking-tight hover:text-oxide"
              >
                {view.name}
              </Link>
              {view.venue ? (
                <p className="mt-1 text-sm text-muted">{view.venue}</p>
              ) : null}
            </div>
            <p className="shrink-0 text-sm text-ink sm:text-right">
              <time dateTime={eventDateSpan(event.when)?.start}>
                {fullEventDateLabel(event.when)}
              </time>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
