"use client";

import type { FlightSearch } from "../flights";
import { SectionIntro, sectionClass } from "./section-intro";
import { EmptyNote, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

function airportSlug(airport: string) {
  return airport
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function FlightsSection() {
  const flights = useRecords<FlightSearch[]>("/api/flights");
  const groups =
    flights.status === "ready"
      ? flights.data.reduce<{ airport: string; rows: FlightSearch[] }[]>(
          (list, flight) => {
            let group = list.find((item) => item.airport === flight.airport);
            if (!group) {
              group = { airport: flight.airport, rows: [] };
              list.push(group);
            }
            group.rows.push(flight);
            return list;
          },
          [],
        )
      : [];

  return (
    <section id="flights" className={sectionClass}>
      <SectionIntro
        kicker="Flights"
        title="Search links"
        lede="Each row opens a Google Flights search. It is a search, not a fare, a seat, or a booking."
      />
      {flights.status === "loading" ? (
        <LoadingLines label="Loading flight searches" />
      ) : null}
      {flights.status === "error" ? (
        <ErrorNote
          message="Flight searches did not load."
          onRetry={flights.retry}
        />
      ) : null}
      {flights.status === "ready" && flights.data.length === 0 ? (
        <EmptyNote>No flight searches are on file.</EmptyNote>
      ) : null}
      {flights.status === "ready" && groups.length > 0 ? (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
            {flights.data.length} searches
          </p>
          <div className="mt-4 flex w-full min-w-0 gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:pb-0">
            {groups.map((group) => (
              <a
                key={group.airport}
                href={`#airport-${airportSlug(group.airport)}`}
                className="chip shrink-0"
              >
                {group.airport}
              </a>
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {groups.map((group) => (
              <article
                key={group.airport}
                id={`airport-${airportSlug(group.airport)}`}
                className="scroll-mt-28 rounded-3xl border border-gold/30 bg-chart px-4 py-4 text-mist shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:px-5"
              >
                <h3 className="font-display text-[1.65rem] leading-tight tracking-tight">
                  {group.airport}
                </h3>
                <ul className="mt-3">
                  {group.rows.map((flight) => (
                    <li key={`${flight.airport}-${flight.origin}`}>
                      <a
                        href={flight.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Search from ${flight.origin} for ${flight.airport}`}
                        className="flex items-baseline justify-between gap-4 border-t border-white/15 py-3"
                      >
                        <span className="font-mono text-sm">{flight.origin}</span>
                        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-light">
                          Search
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
