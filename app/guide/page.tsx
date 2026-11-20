import Link from "next/link";
import { Breadcrumbs } from "../components/breadcrumbs";
import { GetAroundRidesInline } from "../components/get-around-rides";
import {
  GuideCitiesLoadMore,
  GuidePinLoadMore,
  GuidePlaceLoadMore,
  GuideWhatsOnLoadMore,
} from "../components/guide-load-more-lists";
import { GuideArriveLoadMore } from "../components/guide-arrive-load-more";
import { GuideTabs } from "../components/guide-tabs";
import { JsonLd } from "../components/json-ld";
import { ExperiencePartners, StayPartners } from "../components/partner-modules";
import {
  CarHireVisitorBlock,
  EventsVisitorEntry,
  FindAStayOutbound,
  VisitorCategoryHub,
} from "../components/visitor-category-entry";
import { VisitorNextActions } from "../components/visitor-next-actions";
import { VisaSections } from "../components/visa-sections";
import { citiesOnFile } from "../cities";
import { events } from "../events";
import { flightSearches, seasonSearchNote } from "../flights";
import { breadcrumbJsonLd } from "../jsonld";
import { pins } from "../pins";
import { places, type Place } from "../places";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Tourist guide & visa — West Africa",
  description:
    "Detty December tourist guide for Lagos, Accra, and Calabar: visa and entry notes from official Nigeria and Ghana pages, arrive, stay, get around, and what is on — records already on file only.",
  path: "/guide",
});

function isAirport(place: Place) {
  return place.category === "Practical stops" && /airport|aéroport/i.test(place.name);
}

function isTransport(place: Place) {
  return place.category === "Car rental" || isAirport(place);
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

export default function GuidePage() {
  const airports = flightsByAirport();
  const stayPlaces = places.filter((place) => !isTransport(place));
  const transportPlaces = places.filter(isTransport);
  const cities = citiesOnFile();

  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-36">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guide", path: "/guide" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Guide" },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">On file</p>
      <h1 className="mt-2 max-w-3xl font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        Tourist guide
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
        Plan a Detty December or West Africa trip through visa and entry, arrive, stay, get
        around, and what is on. Every line comes from a record already listed. If a fact is not
        listed, it is left out.
      </p>
      <VisitorNextActions className="mt-8" heading="Jump to" />
      <GuideTabs />

      <VisitorCategoryHub />

      <section id="entry" className="mt-10 scroll-mt-36">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Visa and entry</h2>
        <VisaSections />
        <p className="mt-6 text-sm leading-7 text-muted">
          Prefer a short landing page?{" "}
          <Link href="/visa" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Visa and entry
          </Link>
          {" · "}
          <Link href="/west-africa" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            West Africa year-round
          </Link>
        </p>
      </section>

      <section id="arrive" className="mt-14 scroll-mt-36 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Arrive</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          The link opens that search. It is not a fare or a seat. {seasonSearchNote}
        </p>
        <GuideArriveLoadMore airports={airports} />
      </section>

      <section id="stay" className="mt-14 scroll-mt-36 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Stay</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Hotels, short stays, and the other places already filed that are not a
          way of getting around. A link is the organiser page stored on that
          record. Partner hotel searches are labelled, and booking happens on
          their site. Visitors do not pay on this site.{" "}
          <Link href="/guides/where-to-stay-lagos-december" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Where to stay in Lagos in December
          </Link>
        </p>
        <StayPartners placement="guide-stay" />
        <FindAStayOutbound />
        <GuidePlaceLoadMore places={stayPlaces} noun="stay places" />
      </section>

      <section id="around" className="mt-14 scroll-mt-36 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Get around</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Third-party ride apps by country for cities already on this directory,
          then car rental and airport pages already filed, then the map pins. A
          pin with no organiser page stays on the map. This site does not book
          rides or quote fares.
        </p>
        <CarHireVisitorBlock />
        <GetAroundRidesInline />
        <GuidePlaceLoadMore places={transportPlaces} noun="transport places" />
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
          <GuidePinLoadMore pins={pins} />
        </div>
      </section>

      <section id="on" className="mt-14 scroll-mt-36 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">What is on</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Confirmed events already filed. The date, the city, and the venue are
          only what that record stores. A ticket link appears only when the
          record has one.
        </p>
        <EventsVisitorEntry />
        <div className="mt-6">
          <GuideWhatsOnLoadMore events={events} />
        </div>
        <ExperiencePartners placement="guide-on" heading="Tours and experiences by city" />
      </section>

      <section id="cities" className="mt-14 scroll-mt-36 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">Cities</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Each city page is a city already listed.
        </p>
        <GuideCitiesLoadMore cities={cities} />
      </section>
    </main>
  );
}
