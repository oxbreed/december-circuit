import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { disclaimer } from "../../brand";
import {
  CITY_INDEX_MIN_VERIFIED,
  citiesOnFile,
  cityBySlug,
  cityDescription,
  cityIsThin,
  cityVerifiedCount,
} from "../../cities";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { CityEventList, CityPlaceList } from "../../components/city-listings";
import { JsonLd } from "../../components/json-ld";
import {
  breadcrumbJsonLd,
  cityPlaceJsonLd,
  cityPlacesItemListJsonLd,
} from "../../jsonld";
import { countriesOnFile } from "../../countries";
import { shareImageForCity } from "../../share-images";
import { pageMetadata } from "../../site";

export function generateStaticParams() {
  return citiesOnFile().map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = cityBySlug(slug);
  if (!city) return { title: "City" };
  const thin = cityIsThin(city);
  return pageMetadata({
    title: `${city.city}, ${city.country}`,
    description: cityDescription(city),
    path: `/cities/${city.slug}`,
    image: shareImageForCity(city.city),
    // Thin city rule: events + organiser places < 3 → noindex, follow.
    ...(thin
      ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } }
      : {}),
  });
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = cityBySlug(slug);
  if (!city) notFound();
  const description = cityDescription(city);
  const path = `/cities/${city.slug}`;
  const country = countriesOnFile().find((item) => item.country === city.country);
  const placesWithPins = cityPlacesItemListJsonLd(city);
  const thin = cityIsThin(city);
  const verified = cityVerifiedCount(city);

  return (
    <main
      id="top"
      className="mx-auto w-full max-w-6xl px-5 pt-28 pb-28 md:px-8 md:pt-36 lg:pb-16"
    >
      {!thin ? <JsonLd data={cityPlaceJsonLd(city)} /> : null}
      {!thin && placesWithPins ? <JsonLd data={placesWithPins} /> : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cities", path: "/cities" },
          ...(country
            ? [{ name: country.country, path: `/countries/${country.slug}` }]
            : []),
          { name: city.city, path },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Cities", href: "/cities" },
          ...(country
            ? [{ name: country.country, href: `/countries/${country.slug}` }]
            : []),
          { name: city.city },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">
        {city.country}
      </p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">
        {city.city}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{description}</p>
      {thin ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          This city page lists {verified} verified{" "}
          {verified === 1 ? "record" : "records"} on file (confirmed events plus
          organiser pages). Pages with fewer than {CITY_INDEX_MIN_VERIFIED} are
          kept for browsing but are not offered for search indexing.
        </p>
      ) : null}

      <CityEventList events={city.events} cityName={city.city} />
      <CityPlaceList places={city.places} cityName={city.city} />

      <p className="mt-10 text-sm leading-7 text-muted">
        <Link href="/cities" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          All cities
        </Link>
        {" · "}
        <Link href="/places" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          All organiser pages
        </Link>
        {" · "}
        <Link href="/events" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Confirmed events
        </Link>
        {" · "}
        <Link href="/guide#entry" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Visa and entry
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
