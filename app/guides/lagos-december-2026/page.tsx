import Link from "next/link";
import { disclaimer } from "../../brand";
import { EventCard } from "../../components/event-card";
import { JsonLd } from "../../components/json-ld";
import {
  OutboundLink,
  SeasonGuideShell,
} from "../../components/season-guide-chrome";
import { breadcrumbJsonLd } from "../../jsonld";
import {
  lagosArrivalFlights,
  lagosEventsOnFile,
  lagosStayPlaces,
  lagosTransportPlaces,
  nigeriaRideMarket,
  seasonSearchNote,
} from "../../season-guides";
import { pageMetadata } from "../../site";

const path = "/guides/lagos-december-2026";

export const metadata = pageMetadata({
  title: "Lagos December 2026 guide",
  description:
    "Lagos Detty December 2026 guide: confirmed events on file, flight searches into Murtala Muhammed International Airport, hotels and short-stays already listed, and Nigeria ride-app links — sourced only.",
  path,
  type: "article",
});

export default function LagosDecember2026Page() {
  const lagosEvents = lagosEventsOnFile();
  const flights = lagosArrivalFlights();
  const rides = nigeriaRideMarket();
  const stays = lagosStayPlaces();
  const transport = lagosTransportPlaces();

  const flightsByOrigin = new Map<string, string>();
  for (const flight of flights) {
    if (!flightsByOrigin.has(flight.origin)) {
      flightsByOrigin.set(flight.origin, flight.url);
    }
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Lagos December 2026", path },
        ])}
      />
      <SeasonGuideShell
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: "Lagos December 2026" },
        ]}
        kicker="Lagos · events · arrive · rides"
        title={
          <>
            Lagos December <span className="italic text-oxide">2026</span>
          </>
        }
        lede={
          <>
            Confirmed events, arrival flight searches, and get-around links already on this
            directory. Nothing is invented. {disclaimer}
          </>
        }
        currentPath={path}
      >
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight">Events on file</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Lagos rows from the public directory (seed + published ingest). Open each card for
            source links. Flytime Fest lineup detail lives on the tracker.
          </p>
          {lagosEvents.length === 0 ? (
            <p className="mt-6 text-sm leading-7 text-muted">No Lagos events on file.</p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {lagosEvents.map((event) => (
                <EventCard
                  key={`${event.region}-${event.when}-${event.summary}`}
                  event={event}
                  as="h3"
                />
              ))}
            </div>
          )}
          <p className="mt-6 text-sm leading-7">
            <Link
              href="/events/flytime-fest-2026"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Flytime Fest 2026 lineup tracker
            </Link>
            {" · "}
            <Link
              href="/events?city=Lagos"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              All Lagos events
            </Link>
          </p>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Arrive</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Outbound Google Flights searches into Murtala Muhammed International Airport already
            listed on /flights. A link is not a fare or a seat. {seasonSearchNote}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
            {[...flightsByOrigin.entries()].map(([origin, url]) => (
              <li key={origin}>
                <OutboundLink href={url}>{origin} → Lagos</OutboundLink>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-7 text-muted">
            <Link
              href="/flights"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Full flight board
            </Link>
            {" · "}
            <Link
              href="/guide#arrive"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Tourist guide · Arrive
            </Link>
          </p>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Get around</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Nigeria ride-app links from the regional ride-hail matrix (Bolt, inDrive). Outbound
            only — no fares or ETAs here.
          </p>
          {rides ? (
            <ul className="mt-6 space-y-3">
              {rides.apps.map((app) => (
                <li key={app.url} className="border-t border-ink/10 pt-3">
                  <OutboundLink href={app.url}>
                    {app.name} — {app.label}
                  </OutboundLink>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                    Leaves this site · cities on file include Lagos
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
          {transport.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-[11px] uppercase tracking-[0.22em] text-lagoon">
                Airport and car rental on file
              </h3>
              <ul className="mt-3">
                {transport.map((place) => (
                  <li key={place.name} className="border-t border-ink/10 py-3">
                    <p className="text-sm leading-6 text-ink">
                      {place.name}
                      <span className="text-muted"> · {place.category}</span>
                    </p>
                    {place.url ? (
                      <OutboundLink href={place.url}>Organiser page</OutboundLink>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-4 text-sm leading-7 text-muted">
            <Link
              href="/guide#around"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Tourist guide · Get around
            </Link>
            {" · "}
            <Link
              href="/flights#get-around"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Flights · Ride apps
            </Link>
          </p>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Stay (Lagos on file)</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Hotels and short-stay organiser pages already listed for Lagos — not a booking
            inventory.
          </p>
          {stays.length === 0 ? (
            <p className="mt-6 text-sm leading-7 text-muted">No Lagos stay rows on file.</p>
          ) : (
            <ul className="mt-6">
              {stays.map((place) => (
                <li key={place.name} className="border-t border-ink/10 py-3">
                  <p className="text-sm leading-6 text-ink">
                    {place.name}
                    <span className="text-muted"> · {place.category}</span>
                  </p>
                  {place.url ? (
                    <OutboundLink href={place.url}>Organiser page</OutboundLink>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm leading-7 text-muted">
            <Link
              href="/cities/lagos"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Lagos city page
            </Link>
            {" · "}
            <Link
              href="/visa/us"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Visa (US)
            </Link>
            {" · "}
            <Link
              href="/visa/uk"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Visa (UK)
            </Link>
            {" · "}
            <Link
              href="/visa/canada"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Visa (Canada)
            </Link>
          </p>
        </section>
      </SeasonGuideShell>
    </>
  );
}
