"use client";

import type { CircuitEvent } from "../events";
import { SectionIntro, sectionClass } from "./section-intro";
import { EmptyList, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

const atmospheres = [
  "/atmosphere/night-stage.jpg",
  "/atmosphere/night-water.jpg",
  "/atmosphere/night-lanterns.jpg",
  "/atmosphere/night-hall.jpg",
  "/atmosphere/night-street.jpg",
  "/atmosphere/night-club.jpg",
  "/atmosphere/night-skyline.jpg",
  "/atmosphere/night-crowd.jpg",
];

function EventCard({ event, index }: { event: CircuitEvent; index: number }) {
  return (
    <article className="flex h-full flex-col overflow-hidden border border-ink/15 bg-chart shadow-[4px_4px_0_0_rgba(184,67,47,0.16)]">
      <div className="relative aspect-[16/10]">
        <img
          src={atmospheres[index % atmospheres.length]}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <p className="absolute top-4 left-4 bg-paper px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ink">
          {event.region}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-3xl leading-none tracking-tight">{event.when}</h3>
        <p className="mt-4 flex-1 text-sm leading-7 text-muted">{event.summary}</p>
        {event.url ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-between gap-3 text-sm text-brass"
          >
            <span className="underline decoration-gold/50 underline-offset-4">
              {event.urlLabel ?? "Organiser page"} — leaves this site
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50">
              →
            </span>
          </a>
        ) : null}
        {event.ticketsUrl ? (
          <a
            href={event.ticketsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-between gap-3 text-sm text-brass"
          >
            <span className="underline decoration-gold/50 underline-offset-4">Tickets</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50">
              →
            </span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function EventsSection({ rail = false }: { rail?: boolean }) {
  const events = useRecords<CircuitEvent[]>("/api/events");
  const regions =
    events.status === "ready"
      ? events.data.reduce<string[]>((list, event) => {
          if (!list.includes(event.region)) list.push(event.region);
          return list;
        }, [])
      : [];

  const status = (
    <>
      {events.status === "loading" ? <LoadingLines label="Loading events" /> : null}
      {events.status === "error" ? (
        <ErrorNote
          message="The event list did not load. The list is still the one on this site."
          onRetry={events.retry}
        />
      ) : null}
      {events.status === "ready" && events.data.length === 0 ? (
        <EmptyList href="/list" cta="List an event">
          No December 2026 events are listed yet.
        </EmptyList>
      ) : null}
    </>
  );

  if (rail) {
    return (
      <section id="events" className="scroll-mt-36 border-y border-ink/10 bg-paper-deep">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8 md:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Events</p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
              On file for December 2026
            </h2>
          </div>
          <a
            href="/events"
            className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide"
          >
            All events →
          </a>
        </div>
        <div className="mt-6">{status}</div>
        {events.status === "ready" && events.data.length > 0 ? (
          <div className="-mx-5 mt-2 flex gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:px-0">
            {events.data.map((event, index) => (
              <div key={`${event.region}-${event.when}-${event.summary}`} className="w-[19rem] shrink-0">
                <EventCard event={event} index={index} />
              </div>
            ))}
          </div>
        ) : null}
        </div>
      </section>
    );
  }

  return (
    <section id="events" className={sectionClass}>
      <SectionIntro
        kicker="Events"
        title="On file for December 2026"
        lede="Dates come from the organiser or a named news report. A link appears only where the record has one."
      />
      {status}
      {events.status === "ready" && events.data.length > 0 ? (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
            {events.data.length} listed
          </p>
          {regions.map((region) => (
            <div key={region} className="mt-10">
              <h3 className="font-display text-3xl italic tracking-tight text-gold">{region}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {events.data
                  .filter((event) => event.region === region)
                  .map((event) => (
                    <EventCard
                      key={`${event.region}-${event.when}-${event.summary}`}
                      event={event}
                      index={events.data.indexOf(event)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
