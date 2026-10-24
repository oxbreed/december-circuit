import Link from "next/link";
import { disclaimer } from "../brand";
import { citiesOnFile } from "../cities";
import { Breadcrumbs } from "../components/breadcrumbs";
import { EventCard } from "../components/event-card";
import { JsonLd } from "../components/json-ld";
import { events } from "../events";
import { eventsInRegionOrder } from "../event-view";
import {
  breadcrumbJsonLd,
  eventsItemListJsonLd,
} from "../jsonld";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Detty December 2026 — events, cities, guide",
  description:
    "Detty December 2026 hub: confirmed sourced events, Lagos / Accra / Calabar city pages, visa notes, map, and outbound booking links. Independent dirtydecember.info directory — no payment on this site.",
  path: "/detty-december",
});

const hubCities = ["lagos", "accra", "calabar"] as const;

export default function DettyDecemberPage() {
  const confirmed = eventsInRegionOrder(events);
  const cities = citiesOnFile();
  const spotlight = hubCities
    .map((slug) => cities.find((city) => city.slug === slug))
    .filter((city): city is NonNullable<typeof city> => Boolean(city));

  return (
    <main id="top" className="mx-auto w-full max-w-6xl px-5 pb-28 pt-28 md:px-8 md:pt-36 lg:pb-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Detty December", path: "/detty-december" },
        ])}
      />
      <JsonLd
        data={eventsItemListJsonLd(confirmed, "Confirmed Detty December 2026 events on file")}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Detty December" },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">December 2026</p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">
        Detty <span className="italic text-oxide">December</span>
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
        A season hub for diaspora travellers: confirmed events already on file, city organiser
        pages for Lagos, Accra, and Calabar, visa notes from official immigration pages, and
        outbound ticket or flight links. {disclaimer}
      </p>
      <nav aria-label="Season hub" className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-6">
        <Link href="/events" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          All confirmed events
        </Link>
        <Link href="/visa" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Visa and entry
        </Link>
        <Link href="/guide" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Tourist guide
        </Link>
        <Link href="/map" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Map
        </Link>
        <Link href="/flights" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Flights
        </Link>
        <Link href="/faq" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          FAQ
        </Link>
        <Link href="/west-africa" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          West Africa year-round
        </Link>
      </nav>

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight">Confirmed events on file</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Dates and summaries come from organiser pages or named reports. Tickets leave this site.
        </p>
        <div className="mt-5 grid gap-4">
          {confirmed.map((event) => (
            <EventCard key={`${event.region}-${event.when}`} event={event} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl tracking-tight">Season cities</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {spotlight.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="block border border-ink/15 bg-chart px-4 py-5 hover:border-oxide/40"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">{city.country}</p>
                <p className="mt-2 font-display text-3xl leading-none tracking-tight">{city.city}</p>
                <p className="mt-3 text-sm text-muted">
                  {city.events.length > 0
                    ? `${city.events.length} confirmed ${
                        city.events.length === 1 ? "event" : "events"
                      }`
                    : `${city.places.length} organiser pages`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          <Link href="/countries/nigeria" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Nigeria
          </Link>
          {" · "}
          <Link href="/countries/ghana" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Ghana
          </Link>
          {" · "}
          <Link href="/cities" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            All cities
          </Link>
        </p>
      </section>
    </main>
  );
}
