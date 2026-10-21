"use client";

import type { CircuitEvent } from "../events";
import { SectionIntro, sectionClass } from "./section-intro";
import { EmptyNote, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

export function EventsSection() {
  const events = useRecords<CircuitEvent[]>("/api/events");
  const regions =
    events.status === "ready"
      ? events.data.reduce<string[]>((list, event) => {
          if (!list.includes(event.region)) list.push(event.region);
          return list;
        }, [])
      : [];

  return (
    <section id="events" className={sectionClass}>
      <SectionIntro
        kicker="Events"
        title="On file for December 2026"
        lede="Dates come from the organiser or a named news report, checked on 21 October 2026. A link appears only where the record has one."
      />
      {events.status === "loading" ? <LoadingLines label="Loading events" /> : null}
      {events.status === "error" ? (
        <ErrorNote
          message="Events did not load. The list is still the one on this site."
          onRetry={events.retry}
        />
      ) : null}
      {events.status === "ready" && events.data.length === 0 ? (
        <EmptyNote>No December 2026 events are on file.</EmptyNote>
      ) : null}
      {events.status === "ready" && events.data.length > 0 ? (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
            {events.data.length} on file
          </p>
          {regions.map((region) => (
            <div key={region} className="mt-10">
              <h3 className="font-display text-3xl italic tracking-tight text-gold">
                {region}
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {events.data
                  .filter((event) => event.region === region)
                  .map((event) => (
                    <article
                      key={`${event.region}-${event.when}`}
                      className="flex h-full flex-col rounded-3xl border border-gold/30 bg-[#10151f]/90 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
                    >
                      <p className="w-fit rounded-full border border-gold/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-brass">
                        {event.region}
                      </p>
                      <h4 className="mt-5 font-display text-3xl leading-none tracking-tight">
                        {event.when}
                      </h4>
                      <p className="mt-4 flex-1 text-sm leading-7 text-muted">
                        {event.summary}
                      </p>
                      {event.url ? (
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex items-center justify-between gap-3 text-sm text-brass"
                        >
                          <span className="underline decoration-gold/50 underline-offset-4">
                            {event.urlLabel ?? "Organiser page"}
                          </span>
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50">
                            →
                          </span>
                        </a>
                      ) : null}
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
