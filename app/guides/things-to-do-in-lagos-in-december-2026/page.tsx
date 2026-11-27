import Link from "next/link";
import { disclaimer } from "../../brand";
import { EventDateList } from "../../components/event-date-list";
import { JsonLd } from "../../components/json-ld";
import { SeasonGuideShell } from "../../components/season-guide-chrome";
import { cityRecordFor } from "../../cities";
import { breadcrumbJsonLd, eventsItemListJsonLd, webPageJsonLd } from "../../jsonld";
import { placeIsThin } from "../../place-seo";
import { placesOnFile, type PlaceRecord } from "../../place-catalog";
import {
  lagosDiasporaRecreation,
  lagosEventsOnFile,
  lagosStayPlaces,
} from "../../season-guides";
import { pageMetadata } from "../../site";

const path = "/guides/things-to-do-in-lagos-in-december-2026";

export const metadata = pageMetadata({
  title: "Things to do in Lagos in December 2026",
  description:
    "Things to do in Lagos in December 2026: concerts and festivals by date, where to eat and go out, landmarks and where to stay, from the listings on file.",
  path,
  type: "article",
});

const linkClass =
  "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

function lagosPlaces(...categories: string[]) {
  return placesOnFile().filter(
    (place) => place.city === "Lagos" && categories.includes(place.category),
  );
}

function PlaceLinks({ list }: { list: PlaceRecord[] }) {
  return (
    <ul className="mt-5 grid gap-x-8 gap-y-2 text-sm leading-6 sm:grid-cols-2">
      {list.map((place) => (
        <li key={place.slug}>
          {placeIsThin(place) ? (
            <a href={place.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {place.name}
            </a>
          ) : (
            <Link href={`/place/${place.slug}`} className={linkClass}>
              {place.name}
            </Link>
          )}
          {place.area ? <span className="text-muted"> — {place.area}</span> : null}
        </li>
      ))}
    </ul>
  );
}

export default function ThingsToDoLagosPage() {
  const lagosEvents = lagosEventsOnFile();
  const food = lagosPlaces("Restaurants");
  const nightlife = lagosPlaces("Clubs", "Bars", "Boat clubs");
  const outdoors = lagosPlaces("Beaches", "Beach resorts");
  const culture = [
    ...lagosDiasporaRecreation().map((place) => placesOnFile().find((row) => row.name === place.name && row.city === "Lagos")),
    ...lagosPlaces("Cinemas", "Recreation centres"),
  ].filter((place): place is PlaceRecord => Boolean(place));
  const venues = lagosPlaces("Event centres");
  const stays = lagosStayPlaces();
  const city = cityRecordFor("Lagos", "Nigeria");
  const description = `${lagosEvents.length} confirmed events and ${
    food.length + nightlife.length + outdoors.length + culture.length + venues.length
  } places to eat, go out and explore in Lagos.`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Things to do in Lagos in December 2026", path },
        ])}
      />
      <JsonLd
        data={webPageJsonLd({
          path,
          name: "Things to do in Lagos in December 2026",
          description,
        })}
      />
      <JsonLd data={eventsItemListJsonLd(lagosEvents, "Lagos events, December 2026")} />
      <SeasonGuideShell
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: "Things to do in Lagos" },
        ]}
        kicker="Lagos · December 2026"
        title={
          <>
            Things to do in Lagos in December{" "}
            <span className="italic text-oxide">2026</span>
          </>
        }
        lede={
          <>
            {description} Everything here comes from the listings on this site, with a link to
            the organiser or venue page. {disclaimer}
          </>
        }
        currentPath={path}
      >
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight">
            Concerts and festivals in Lagos, by date
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Every confirmed Lagos event on file, earliest first. Open an event for the source,
            venue and ticket link.
          </p>
          <div className="mt-6">
            <EventDateList list={lagosEvents} />
          </div>
          <p className="mt-5 text-sm leading-7 text-muted">
            <Link href="/detty-december/calendar" className={linkClass}>
              Full Detty December 2026 calendar
            </Link>
            {" · "}
            <Link href="/events/flytime-fest-2026" className={linkClass}>
              Flytime Fest lineup tracker
            </Link>
            {" · "}
            <Link href="/guides/detty-december-ticket-safety-2026" className={linkClass}>
              How to buy real tickets
            </Link>
          </p>
        </section>

        {food.length > 0 ? (
          <section className="mt-14 border-t border-ink/10 pt-10">
            <h2 className="font-display text-3xl tracking-tight">Where to eat in Lagos</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              {food.length} restaurants on file. Open one to see its area, source and organiser
              page.
            </p>
            <PlaceLinks list={food} />
            <p className="mt-4 text-sm">
              <Link href="/categories/restaurants" className={linkClass}>
                All restaurants in West Africa
              </Link>
            </p>
          </section>
        ) : null}

        {nightlife.length > 0 ? (
          <section className="mt-14 border-t border-ink/10 pt-10">
            <h2 className="font-display text-3xl tracking-tight">
              Clubs, bars and boat clubs in Lagos
            </h2>
            <PlaceLinks list={nightlife} />
            <p className="mt-4 text-sm">
              <Link href="/categories/clubs" className={linkClass}>
                All clubs
              </Link>
            </p>
          </section>
        ) : null}

        {outdoors.length > 0 ? (
          <section className="mt-14 border-t border-ink/10 pt-10">
            <h2 className="font-display text-3xl tracking-tight">Beaches and beach resorts</h2>
            <PlaceLinks list={outdoors} />
          </section>
        ) : null}

        {culture.length > 0 ? (
          <section className="mt-14 border-t border-ink/10 pt-10">
            <h2 className="font-display text-3xl tracking-tight">
              Landmarks, museums, cinemas and recreation
            </h2>
            <PlaceLinks list={culture} />
          </section>
        ) : null}

        {venues.length > 0 ? (
          <section className="mt-14 border-t border-ink/10 pt-10">
            <h2 className="font-display text-3xl tracking-tight">Event centres and venues</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Where the big December shows are held, and other halls on file.
            </p>
            <PlaceLinks list={venues} />
          </section>
        ) : null}

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Where to stay in Lagos</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            {stays.length} hotels and short stays are on file for Lagos. Booking happens on the
            partner or hotel site, not here.
          </p>
          <p className="mt-4 text-sm leading-7">
            <Link href="/guides/where-to-stay-lagos-december" className={linkClass}>
              Where to stay in Lagos in December
            </Link>
            {" · "}
            <Link href="/categories/hotels" className={linkClass}>All hotels</Link>
          </p>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Plan the rest of the trip</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6">
            <li>
              <Link href="/guides/lagos-december-2026" className={linkClass}>
                Lagos December 2026 guide
              </Link>
              <span className="text-muted"> — arrival flights and ride links</span>
            </li>
            <li>
              <Link href="/map" className={linkClass}>Map</Link>
              <span className="text-muted"> — venues and hotels with sourced coordinates</span>
            </li>
            <li>
              <Link href="/visa" className={linkClass}>Visa and entry</Link>
              <span className="text-muted"> — Nigeria and Ghana</span>
            </li>
            {city ? (
              <li>
                <Link href={`/cities/${city.slug}`} className={linkClass}>
                  Lagos city page
                </Link>
                <span className="text-muted"> — everything on file for Lagos</span>
              </li>
            ) : null}
          </ul>
        </section>
      </SeasonGuideShell>
    </>
  );
}
