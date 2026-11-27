import Link from "next/link";
import { citiesOnFile } from "../cities";
import { eventDateSpan, fullEventDateLabel } from "../event-dates";
import { eventSlug, presentEvent } from "../event-view";
import { events, type CircuitEvent } from "../events";
import { sortByStart } from "./event-date-list";

const linkClass =
  "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

/** Other events in the same city, nearest start dates first, plus city and calendar links. */
export function RelatedEvents({ event }: { event: CircuitEvent }) {
  const self = eventSlug(event);
  const view = presentEvent(event);
  const start = eventDateSpan(event.when)?.start ?? "";
  const others = sortByStart(
    events.filter(
      (item) => item.region === event.region && eventSlug(item) !== self,
    ),
  )
    .map((item) => ({
      item,
      gap: Math.abs(
        new Date(eventDateSpan(item.when)?.start ?? start).getTime() -
          new Date(start || "2026-12-15").getTime(),
      ),
    }))
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 5)
    .map((row) => row.item);
  const city = citiesOnFile().find((item) => item.city === view.region) ?? null;
  const cityHref = city ? `/cities/${city.slug}` : null;

  return (
    <section className="mt-10 border-t border-ink/10 pt-8">
      <h2 className="font-display text-2xl tracking-tight">
        More Detty December 2026 events in {view.region}
      </h2>
      {others.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm leading-6">
          {others.map((item) => {
            const other = presentEvent(item);
            return (
              <li key={other.slug}>
                <Link href={other.href} className={linkClass}>
                  {other.name}
                </Link>
                <span className="text-muted"> — {fullEventDateLabel(item.when)}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className="mt-4 text-sm leading-7 text-muted">
        {cityHref ? (
          <>
            <Link href={cityHref} className={linkClass}>
              {view.region} guide
            </Link>
            {" · "}
          </>
        ) : null}
        <Link href="/detty-december/calendar" className={linkClass}>
          Full calendar
        </Link>
        {" · "}
        <Link href="/guides/detty-december-ticket-safety-2026" className={linkClass}>
          Ticket safety
        </Link>
        {view.region === "Lagos" ? (
          <>
            {" · "}
            <Link href="/guides/things-to-do-in-lagos-in-december-2026" className={linkClass}>
              Things to do in Lagos
            </Link>
          </>
        ) : null}
        {view.region === "Accra" ? (
          <>
            {" · "}
            <Link href="/guides/accra-ghana-2026" className={linkClass}>
              Accra December guide
            </Link>
          </>
        ) : null}
      </p>
    </section>
  );
}
