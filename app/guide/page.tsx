import Link from "next/link";
import { EventCard } from "../components/event-card";
import { citiesOnFile } from "../cities";
import { events } from "../events";
import { flightSearches } from "../flights";
import { pins, type Pin } from "../pins";
import { places, type Place } from "../places";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Guide",
  description:
    "A tourist guide through arrive, stay, get around, and what is on, using only records already on file.",
  path: "/guide",
});

const stayFirst = ["Hotels", "Short-stay"];

function isAirport(place: Place) {
  return place.category === "Practical stops" && /airport|aéroport/i.test(place.name);
}

function isTransport(place: Place) {
  return place.category === "Car rental" || isAirport(place);
}

function byCity<T extends { country: string; city: string }>(rows: T[]) {
  const groups: { country: string; city: string; rows: T[] }[] = [];
  for (const row of rows) {
    let group = groups.find((item) => item.country === row.country && item.city === row.city);
    if (!group) {
      group = { country: row.country, city: row.city, rows: [] };
      groups.push(group);
    }
    group.rows.push(row);
  }
  return groups;
}

function byCategory(rows: Place[]) {
  const names: string[] = [];
  for (const name of stayFirst) {
    if (rows.some((place) => place.category === name)) names.push(name);
  }
  for (const place of rows) {
    if (!names.includes(place.category)) names.push(place.category);
  }
  return names.map((category) => ({
    category,
    cities: byCity(rows.filter((place) => place.category === category)),
  }));
}

function flightsByAirport() {
  const groups: { airport: string; origins: { origin: string; url: string }[] }[] = [];
  for (const flight of flightSearches) {
    let group = groups.find((item) => item.airport === flight.airport);
    if (!group) {
      group = { airport: flight.airport, origins: [] };
      groups.push(group);
    }
    group.origins.push({ origin: flight.origin, url: flight.url });
  }
  return groups;
}

function PlaceList({ rows }: { rows: Place[] }) {
  const groups = byCategory(rows);
  if (groups.length === 0) return null;
  return (
    <div className="mt-8 grid gap-10">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-lagoon">{group.category}</h3>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {group.cities.map((city) => (
              <section key={`${city.country}-${city.city}`} className="min-w-0">
                <h4 className="font-display text-2xl leading-tight tracking-tight">
                  {city.city}, {city.country}
                </h4>
                <ul className="mt-2">
                  {city.rows.map((place) => (
                    <li
                      key={`${place.category}-${place.name}`}
                      className="border-t border-ink/10 py-3"
                    >
                      <p className="text-sm leading-6 text-ink">{place.name}</p>
                      {place.url ? (
                        <a
                          href={place.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                        >
                          Organiser page
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PinList({ rows }: { rows: Pin[] }) {
  const groups = byCity(rows);
  return (
    <div className="mt-4 grid gap-6 md:grid-cols-2">
      {groups.map((city) => (
        <section key={`${city.country}-${city.city}`} className="min-w-0">
          <h4 className="font-display text-2xl leading-tight tracking-tight">
            {city.city}, {city.country}
          </h4>
          <ul className="mt-2">
            {city.rows.map((pin) => (
              <li key={`${pin.name}-${pin.latitude}-${pin.longitude}`} className="border-t border-ink/10 py-3">
                <p className="text-sm leading-6 text-ink">{pin.name}</p>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {pin.url ? (
                    <a
                      href={pin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                    >
                      Organiser page
                    </a>
                  ) : null}
                  <Link
                    href="/map"
                    className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                  >
                    On the map
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function GuidePage() {
  const airports = flightsByAirport();
  const stayPlaces = places.filter((place) => !isTransport(place));
  const transportPlaces = places.filter(isTransport);
  const cities = citiesOnFile();

  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-36">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">On file</p>
      <h1 className="mt-2 max-w-3xl font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        Tourist guide
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
        Move through arrive, stay, get around, and what is on. Every line comes
        from a record already filed. If a fact is not on file, it is left out.
      </p>
      <nav aria-label="Guide" className="mt-5 flex flex-wrap gap-2">
        <a href="#arrive" className="chip">
          Arrive
        </a>
        <a href="#stay" className="chip">
          Stay
        </a>
        <a href="#around" className="chip">
          Get around
        </a>
        <a href="#on" className="chip">
          What is on
        </a>
      </nav>

      <section id="arrive" className="mt-10 scroll-mt-36">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Arrive</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Flight searches already filed. The link opens that search. It is not a
          fare or a seat.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {airports.map((airport) => (
            <article key={airport.airport} className="min-w-0 border border-ink/15 bg-chart p-4">
              <h3 className="font-display text-2xl leading-tight tracking-tight">{airport.airport}</h3>
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
                {airport.origins.map((origin) => (
                  <li key={origin.origin}>
                    <a
                      href={origin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                    >
                      {origin.origin}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="stay" className="mt-14 scroll-mt-36 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Stay</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Hotels, short stays, and the other places already filed that are not a
          way of getting around. A link is the organiser page stored on that
          record. This site does not take payment.
        </p>
        <PlaceList rows={stayPlaces} />
      </section>

      <section id="around" className="mt-14 scroll-mt-36 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Get around</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Car rental and airport pages already filed, then the map pins. A pin
          with no organiser page stays on the map.
        </p>
        <PlaceList rows={transportPlaces} />
        <div className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-[11px] uppercase tracking-[0.22em] text-lagoon">Map pins</h3>
            <Link
              href="/map"
              className="text-[11px] uppercase tracking-[0.18em] text-oxide"
            >
              Open the map
            </Link>
          </div>
          <PinList rows={pins} />
        </div>
      </section>

      <section id="on" className="mt-14 scroll-mt-36 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">What is on</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Confirmed events already filed. The date, the city, and the venue are
          only what that record stores. A ticket link appears only when the
          record has one.
        </p>
        <div className="mt-6 grid gap-4">
          {events.map((event) => (
            <EventCard key={`${event.region}-${event.when}`} event={event} as="h3" />
          ))}
        </div>
      </section>

      <section id="cities" className="mt-14 scroll-mt-36 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Cities</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Each city page is a city already on file.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {cities.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {city.city}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
