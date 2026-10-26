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
  accraArrivalFlights,
  accraStayPlaces,
  ghanaRideMarket,
  ghanaSeasonEventsOnFile,
  ghanaTourismLinks,
  newsGhanaSection,
  seasonSearchNote,
} from "../../season-guides";
import { pageMetadata } from "../../site";

const path = "/guides/accra-ghana-2026";

export const metadata = pageMetadata({
  title: "Accra and Ghana December 2026",
  description:
    "December in Ghana 2026 from the GTA programme on file, Accra arrival and ride links, visitghana.com and ghana.travel tourism outbound, and a sourced NewsGhana section — no invented headlines or events.",
  path,
  type: "article",
});

export default function AccraGhana2026Page() {
  const seasonEvents = ghanaSeasonEventsOnFile();
  const flights = accraArrivalFlights();
  const rides = ghanaRideMarket();
  const stays = accraStayPlaces();

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
          { name: "Accra and Ghana 2026", path },
        ])}
      />
      <SeasonGuideShell
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: "Accra and Ghana 2026" },
        ]}
        kicker="Ghana · GTA programme · Accra"
        title={
          <>
            Accra and Ghana <span className="italic text-oxide">2026</span>
          </>
        }
        lede={
          <>
            December in Ghana from the Ghana Tourism Authority programme already on file, plus
            tourism and news outbound links. Individual Accra club nights are listed only when a
            sourced directory row exists. {disclaimer}
          </>
        }
        currentPath={path}
      >
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight">GTA programme on file</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Season dates and framing come from the named MyJoyOnline report of the Ghana Tourism
            Authority December in GH 2026 calendar (sourceId{" "}
            <code className="text-ink">december-in-ghana-myjoy</code>). Official decemberingh.com
            and ghana.travel Black Star Experience URLs are on file as probes and do not currently
            replace that dated news report for season dates.
          </p>
          {seasonEvents.length === 0 ? (
            <p className="mt-6 text-sm leading-7 text-muted">
              No December in Ghana season row is on file.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-1">
              {seasonEvents.map((event) => (
                <EventCard
                  key={`${event.region}-${event.when}-${event.summary}`}
                  event={event}
                  as="h3"
                />
              ))}
            </div>
          )}
          <p className="mt-6 text-sm leading-7 text-muted">
            The MyJoyOnline report states a large national calendar (about 150 events in that
            coverage). This directory does not invent those individual events — only the season
            dates already confirmed on the published row appear above until more Tier-1 nights are
            ingested.
          </p>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Tourism information</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Point to official Ghana tourism sites for general travel information. Opening a link
            leaves dirtydecember.info.
          </p>
          <ul className="mt-6 space-y-4">
            {ghanaTourismLinks.map((link) => (
              <li key={link.url} className="border-t border-ink/10 pt-4">
                <OutboundLink href={link.url}>{link.name}</OutboundLink>
                <p className="mt-1 text-sm leading-6 text-muted">{link.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">News Ghana</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
            {newsGhanaSection.feedStatus}
          </p>
          <p className="mt-4">
            <OutboundLink href={newsGhanaSection.homeUrl}>
              {newsGhanaSection.name} — leaves this site
            </OutboundLink>
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            {newsGhanaSection.relatedFeedsNote}{" "}
            <Link
              href="/news"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Open /news
            </Link>{" "}
            for headlines already fetched from those feeds.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            {newsGhanaSection.relatedFeedsOnFile.map((url) => (
              <li key={url} className="break-all">
                <OutboundLink href={url}>{url}</OutboundLink>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Arrive · Accra</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Flight searches into Accra International Airport already on /flights. Not fares.{" "}
            {seasonSearchNote}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
            {[...flightsByOrigin.entries()].map(([origin, url]) => (
              <li key={origin}>
                <OutboundLink href={url}>{origin} → Accra</OutboundLink>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Get around · Ghana</h2>
          {rides ? (
            <ul className="mt-6 space-y-3">
              {rides.apps.map((app) => (
                <li key={app.url} className="border-t border-ink/10 pt-3">
                  <OutboundLink href={app.url}>
                    {app.name} — {app.label}
                  </OutboundLink>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                    Leaves this site · Accra is among Ghana cities on file
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Stay · Accra on file</h2>
          {stays.length === 0 ? (
            <p className="mt-6 text-sm leading-7 text-muted">No Accra stay rows on file.</p>
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
          <p className="mt-6 text-sm leading-7 text-muted">
            <Link
              href="/cities/accra"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Accra city page
            </Link>
            {" · "}
            <Link
              href="/countries/ghana"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Ghana country hub
            </Link>
            {" · "}
            <Link
              href="/visa"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Visa and entry
            </Link>
          </p>
        </section>
      </SeasonGuideShell>
    </>
  );
}
