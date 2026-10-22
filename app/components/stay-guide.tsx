import { EventCard } from "./event-card";
import { events, type CircuitEvent } from "../events";
import { flightSearches, type FlightSearch } from "../flights";
import { places, type Place } from "../places";

const stayCategories = ["Hotels", "Short-stay", "Practical stops", "Car rental"] as const;

const stayAirports = [
  "Murtala Muhammed International Airport",
  "Accra International Airport",
  "Margaret Ekpo International Airport",
];

function helpsAStay(place: Place) {
  if (!stayCategories.includes(place.category as (typeof stayCategories)[number])) return false;
  if (place.country === "Ghana") return true;
  return (
    (place.country === "Nigeria" && place.city === "Lagos") ||
    (place.country === "Nigeria" && place.city === "Calabar")
  );
}

function groupFlights(rows: FlightSearch[]) {
  const groups: { airport: string; rows: FlightSearch[] }[] = [];
  for (const flight of rows) {
    let group = groups.find((item) => item.airport === flight.airport);
    if (!group) {
      group = { airport: flight.airport, rows: [] };
      groups.push(group);
    }
    group.rows.push(flight);
  }
  return groups;
}

function groupPlaces(rows: Place[]) {
  const groups: { category: string; rows: Place[] }[] = [];
  for (const category of stayCategories) {
    const matches = rows.filter((place) => place.category === category);
    if (matches.length > 0) groups.push({ category, rows: matches });
  }
  return groups;
}

function RecordLink({ href, label }: { href?: string; label: string }) {
  if (!href) {
    return <p className="mt-4 text-sm leading-6 text-muted">The link is not on file.</p>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex bg-oxide px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart"
    >
      {label}
    </a>
  );
}

export function StayGuide() {
  const confirmed: CircuitEvent[] = events;
  const flights = flightSearches.filter((flight) => stayAirports.includes(flight.airport));
  const flightGroups = groupFlights(flights);
  const stayPlaces = places.filter(helpsAStay);
  const placeGroups = groupPlaces(stayPlaces);

  return (
    <section id="stay" className="scroll-mt-36 border-y border-ink/10 bg-paper-deep">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">The stay</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl leading-none tracking-tight md:text-5xl">
          Plan the trip from what is on file
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          You are flying in for the season. This guide sorts the records already
          filed: confirmed events, flight searches, places that help a stay, and
          the map. A button opens only a link stored on that record. This site
          does not take payment.
        </p>
        <nav aria-label="Stay guide" className="mt-6 flex flex-wrap gap-2">
          <a href="#stay-events" className="chip">
            Confirmed events
          </a>
          <a href="#stay-flights" className="chip">
            Flight searches
          </a>
          <a href="#stay-places" className="chip">
            Places for the stay
          </a>
          <a href="#stay-map" className="chip">
            Map
          </a>
        </nav>

        <div id="stay-events" className="scroll-mt-36 mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-display text-3xl leading-none tracking-tight md:text-4xl">
              Confirmed events
            </h3>
            <a href="/events" className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide">
              Find by city and date →
            </a>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            These are the events on file for December 2026. The date, the city,
            and the venue are only what that record stores.
          </p>
          {confirmed.length === 0 ? (
            <p className="mt-6 text-sm leading-7 text-muted">No events are on file.</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {confirmed.map((event) => (
                <EventCard key={`${event.region}-${event.when}`} event={event} as="h4" />
              ))}
            </div>
          )}
        </div>

        <div id="stay-flights" className="scroll-mt-36 mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-display text-3xl leading-none tracking-tight md:text-4xl">
              Flight searches
            </h3>
            <a href="/flights" className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide">
              All searches →
            </a>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            These searches were already filed for Murtala Muhammed, Accra, and
            Margaret Ekpo. Events on file name Lagos, Calabar, and Ghana. Each
            search opens outside this site. It is not a fare, a seat, or a booking.
          </p>
          {flightGroups.length === 0 ? (
            <p className="mt-6 text-sm leading-7 text-muted">No flight searches are on file.</p>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {flightGroups.map((group) => (
                <article
                  key={group.airport}
                  className="min-w-0 border border-ink/15 bg-chart p-4 shadow-[4px_4px_0_0_rgba(138,98,50,0.16)]"
                >
                  <h4 className="font-display text-2xl leading-tight tracking-tight">
                    {group.airport}
                  </h4>
                  <ul className="mt-3">
                    {group.rows.map((flight) => (
                      <li
                        key={`${flight.airport}-${flight.origin}`}
                        className="border-t border-ink/10 py-3"
                      >
                        <p className="font-mono text-sm">{flight.origin}</p>
                        <RecordLink href={flight.url} label="Search" />
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>

        <div id="stay-places" className="scroll-mt-36 mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-display text-3xl leading-none tracking-tight md:text-4xl">
              Places for the stay
            </h3>
            <a href="/places" className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide">
              All places →
            </a>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Hotels, short-stay, practical stops, and car rental already filed in
            Lagos, Calabar, and Ghana. Other categories and cities stay on the
            places list.
          </p>
          {placeGroups.length === 0 ? (
            <p className="mt-6 text-sm leading-7 text-muted">No stay places are on file.</p>
          ) : (
            <div className="mt-6 grid gap-8">
              {placeGroups.map((group) => (
                <div key={group.category}>
                  <h4 className="text-[11px] uppercase tracking-[0.22em] text-lagoon">
                    {group.category}
                  </h4>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {group.rows.map((place) => (
                      <article
                        key={`${place.country}-${place.city}-${place.category}-${place.name}`}
                        className="min-w-0 border border-ink/15 bg-chart p-4"
                      >
                        <h5 className="font-display text-2xl leading-tight tracking-tight">
                          {place.name}
                        </h5>
                        <p className="mt-2 text-sm text-muted">
                          {place.city}, {place.country}
                        </p>
                        <RecordLink href={place.url} label="Organiser page" />
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
