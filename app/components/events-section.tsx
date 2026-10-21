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
        index="01"
        title="Events"
        lede="December 2026 dates already on file. A link appears only where the record has one."
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
            <div key={region} className="mt-8">
              <h3 className="font-display text-3xl italic tracking-tight">{region}</h3>
              <div className="mt-2">
                {events.data
                  .filter((event) => event.region === region)
                  .map((event) => (
                    <article
                      key={`${event.region}-${event.when}`}
                      className="grid gap-2 border-t border-line py-5 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8"
                    >
                      <p className="font-display text-[1.7rem] leading-none tracking-tight">
                        {event.when}
                      </p>
                      <div>
                        <p className="max-w-3xl text-lg leading-8">{event.summary}</p>
                        {event.url ? (
                          <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block text-oxide underline decoration-1 underline-offset-4"
                          >
                            {event.urlLabel ?? "Organiser page"}
                          </a>
                        ) : null}
                      </div>
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
