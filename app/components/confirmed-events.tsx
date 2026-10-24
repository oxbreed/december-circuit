import Link from "next/link";
import { events } from "../events";
import { eventsInRegionOrder } from "../event-view";
import { EventCard } from "./event-card";

export function ConfirmedEvents() {
  const confirmed = eventsInRegionOrder(events);

  return (
    <section id="confirmed" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">December 2026</p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
              Confirmed events
            </h2>
          </div>
          <Link href="/events" className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide">
            Find by city and date →
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Lagos is listed before Calabar. The date and the city are what the record stores. A venue line appears only when the record names one.
        </p>
        {confirmed.length === 0 ? (
          <p className="mt-6 text-sm leading-7 text-muted">No events are listed.</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {confirmed.map((event) => (
              <EventCard key={`${event.region}-${event.when}`} event={event} as="h3" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
