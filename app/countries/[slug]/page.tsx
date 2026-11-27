import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { disclaimer } from "../../brand";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { CityIndexLoadMore } from "../../components/city-index-load-more";
import { EventLoadMoreCards } from "../../components/event-load-more";
import { JsonLd } from "../../components/json-ld";
import {
  countriesOnFile,
  countryBySlug,
  countryDescription,
  placesCountryHref,
} from "../../countries";
import {
  breadcrumbJsonLd,
  countryCitiesItemListJsonLd,
  countryJsonLd,
} from "../../jsonld";
import { pageMetadata } from "../../site";
import { fitTitleFrom } from "../../seo";

export function generateStaticParams() {
  return countriesOnFile().map((country) => ({ slug: country.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = countryBySlug(slug);
  if (!country) return { title: "Country" };
  return pageMetadata({
    title: fitTitleFrom([
      `${country.country} Travel Guide: Cities & December 2026 Events`,
      `${country.country} Detty December 2026: Cities & Events`,
      `${country.country} Travel Guide: Cities, Places & Events`,
    ]),
    description: countryDescription(country),
    path: `/countries/${country.slug}`,
  });
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = countryBySlug(slug);
  if (!country) notFound();
  const description = countryDescription(country);
  const path = `/countries/${country.slug}`;

  return (
    <main
      id="top"
      className="mx-auto w-full max-w-6xl px-5 pt-28 pb-28 md:px-8 md:pt-36 lg:pb-16"
    >
      <JsonLd data={countryJsonLd(country)} />
      <JsonLd data={countryCitiesItemListJsonLd(country)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cities", path: "/cities" },
          { name: country.country, path },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Cities", href: "/cities" },
          { name: country.country },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">West Africa</p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">
        {country.country}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{description}</p>
      <p className="mt-4 text-sm leading-7 text-muted">
        <Link
          href={placesCountryHref(country.country)}
          className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
        >
          Browse places in {country.country}
        </Link>
        {" · "}
        <Link href="/west-africa" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          West Africa hub
        </Link>
      </p>

      {country.events.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight">Confirmed events</h2>
          <div className="mt-5">
            <EventLoadMoreCards events={country.events} />
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight">Cities on file</h2>
        <div className="mt-5">
          <CityIndexLoadMore cities={country.cities} />
        </div>
      </section>

      <p className="mt-10 text-sm leading-7 text-muted">
        <Link href="/cities" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          All cities
        </Link>
        {" · "}
        <Link href="/detty-december" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Detty December
        </Link>
        {" · "}
        <Link href="/visa" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Visa and entry
        </Link>
        {" · "}
        <Link href="/events" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Events
        </Link>
        {" · "}
        <Link href="/map" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Map
        </Link>
      </p>
      <p className="mt-6 max-w-xl text-sm leading-7 text-muted">{disclaimer}</p>
    </main>
  );
}
