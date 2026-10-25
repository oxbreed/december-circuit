import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { disclaimer } from "../../brand";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { EventCard } from "../../components/event-card";
import { JsonLd } from "../../components/json-ld";
import {
  countriesOnFile,
  countryBySlug,
  countryDescription,
} from "../../countries";
import {
  breadcrumbJsonLd,
  countryCitiesItemListJsonLd,
  countryJsonLd,
} from "../../jsonld";
import { pageMetadata } from "../../site";

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
    title: `${country.country} — cities & December events`,
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

      {country.events.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight">Confirmed events</h2>
          <div className="mt-5 grid gap-4">
            {country.events.map((event) => (
              <EventCard key={`${event.region}-${event.when}-${event.summary}`} event={event} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight">Cities on file</h2>
        <ul className="mt-5 divide-y divide-ink/10 border border-ink/15 bg-chart">
          {country.cities.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="flex flex-col gap-1 px-4 py-4 hover:bg-paper sm:flex-row sm:items-baseline sm:justify-between sm:px-5"
              >
                <span className="font-display text-2xl leading-none tracking-tight">
                  {city.city}
                </span>
                <span className="text-sm text-muted">
                  {city.events.length > 0
                    ? `${city.events.length} confirmed ${
                        city.events.length === 1 ? "event" : "events"
                      } · `
                    : null}
                  {city.places.length} organiser{" "}
                  {city.places.length === 1 ? "page" : "pages"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
