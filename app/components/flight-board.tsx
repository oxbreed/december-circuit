import type { FlightSearch } from "../flights";
import { EmptyNote } from "./states";

function airportSlug(airport: string) {
  return airport
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function groupFlights(flights: FlightSearch[]) {
  const groups: { airport: string; rows: FlightSearch[] }[] = [];
  for (const flight of flights) {
    let group = groups.find((item) => item.airport === flight.airport);
    if (!group) {
      group = { airport: flight.airport, rows: [] };
      groups.push(group);
    }
    group.rows.push(flight);
  }
  return groups;
}

export function FlightBoard({ flights }: { flights: FlightSearch[] }) {
  const groups = groupFlights(flights);
  if (groups.length === 0) {
    return (
      <EmptyNote>
        No flight searches are listed. Flight rows open an outbound search only —
        this site does not invent fares.{" "}
        <a
          href="/list"
          className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
        >
          List an event or place
        </a>{" "}
        if you have something to add to the directory.
      </EmptyNote>
    );
  }

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
        {flights.length} searches
      </p>
      <div className="mt-4 flex w-full min-w-0 gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:pb-0">
        {groups.map((group) => (
          <a key={group.airport} href={`#airport-${airportSlug(group.airport)}`} className="chip shrink-0">
            {group.airport}
          </a>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <article
            key={group.airport}
            id={`airport-${airportSlug(group.airport)}`}
            className="scroll-mt-36 border border-ink/15 bg-chart px-4 py-4 text-ink shadow-[4px_4px_0_0_rgba(138,98,50,0.16)] md:px-5"
          >
            <h3 className="font-display text-[1.65rem] leading-tight tracking-tight">{group.airport}</h3>
            <ul className="mt-3">
              {group.rows.map((flight) => (
                <li key={`${flight.airport}-${flight.origin}`}>
                  <a
                    href={flight.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Search from ${flight.origin} for ${flight.airport}`}
                    className="flex items-baseline justify-between gap-4 border-t border-line py-3"
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
  );
}
