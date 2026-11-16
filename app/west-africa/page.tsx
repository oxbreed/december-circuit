import Link from "next/link";
import { disclaimer } from "../brand";
import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import {
  WestAfricaCategoriesLoadMore,
  WestAfricaCityLinksLoadMore,
  WestAfricaCountriesLoadMore,
} from "../components/west-africa-load-more";
import { countriesOnFile, placesCountryHref } from "../countries";
import { categoryIndex } from "../explore-categories";
import {
  breadcrumbJsonLd,
  citiesItemListJsonLd,
  webPageJsonLd,
} from "../jsonld";
import { citiesOnFile } from "../cities";
import { pageMetadata } from "../site";
import { shareImageForCity } from "../share-images";

export const metadata = pageMetadata({
  title: "West Africa tourism directory",
  description:
    "Year-round West Africa tourism directory: cities, organiser pages, hotels, restaurants, clubs, maps, and flights across Nigeria, Ghana, and neighbouring countries on file — plus Detty December season pages. Outbound bookings only.",
  path: "/west-africa",
  image: shareImageForCity("Lagos"),
});

export default function WestAfricaPage() {
  const countries = countriesOnFile();
  const categories = categoryIndex();
  const cities = citiesOnFile();

  return (
    <main id="top" className="mx-auto w-full max-w-6xl px-5 pb-28 pt-28 md:px-8 md:pt-36 lg:pb-16">
      <JsonLd
        data={webPageJsonLd({
          path: "/west-africa",
          name: "West Africa tourism directory",
          description:
            "Year-round West Africa tourism directory of sourced cities, places, and December season pages on dirtydecember.info.",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "West Africa", path: "/west-africa" },
        ])}
      />
      <JsonLd data={citiesItemListJsonLd(cities)} />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "West Africa" },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">On file</p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">
        West Africa
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
        A year-round directory of cities and organiser pages already listed — hotels, restaurants,
        clubs, practical stops, and more — with Detty December season pages when confirmed events
        are on file. Booking always leaves this site. {disclaimer}
      </p>
      <nav aria-label="West Africa hub" className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-6">
        <Link href="/detty-december" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Detty December
        </Link>
        <Link href="/guide" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Tourist guide
        </Link>
        <Link href="/visa" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Visa and entry
        </Link>
        <Link href="/map" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Map
        </Link>
        <Link href="/flights" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Flights
        </Link>
        <Link href="/cities" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          All cities
        </Link>
        <Link href="/places" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Places
        </Link>
      </nav>

      <section className="mt-12 border border-ink/15 bg-chart px-5 py-6 md:px-6">
        <h2 className="font-display text-2xl tracking-tight md:text-3xl">
          Year-round directory
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          This hub is not only for the December season. It lists sourced cities and organiser
          pages across West Africa for travel any time of year. Detty December pages and confirmed
          event counts appear when those records are already on file — nothing is invented for
          the calendar.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight">Countries on file</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Open a country landing for its cities, or browse that country&apos;s organiser pages in
          Places. Counts are from records already listed — places and confirmed events only.
        </p>
        <WestAfricaCountriesLoadMore
          countries={countries}
          placesHref={placesCountryHref}
        />
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl tracking-tight">Browse by category</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Organiser pages already listed, plus Explore map hubs for shopping, car shops, and
          landmarks — not reviews or prices.
        </p>
        <WestAfricaCategoriesLoadMore categories={categories} />
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl tracking-tight">City entry points</h2>
        <WestAfricaCityLinksLoadMore cities={cities} />
        <p className="mt-4 text-sm text-muted">
          <Link href="/cities" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            All cities →
          </Link>
        </p>
      </section>
    </main>
  );
}
