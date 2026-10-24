import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { disclaimer } from "../../brand";
import { cityRecordFor } from "../../cities";
import { countriesOnFile } from "../../countries";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { JsonLd } from "../../components/json-ld";
import { pinForName } from "../../geo";
import {
  breadcrumbJsonLd,
  listedPlaceJsonLd,
} from "../../jsonld";
import {
  categorySlug,
  placeBySlug,
  placeDescription,
  placesOnFile,
} from "../../place-catalog";
import { pageMetadata } from "../../site";
import { shareImageForCity } from "../../share-images";

export function generateStaticParams() {
  return placesOnFile().map((place) => ({ slug: place.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = placeBySlug(slug);
  if (!place) return { title: "Place" };
  return pageMetadata({
    title: `${place.name} — ${place.city}`,
    description: placeDescription(place),
    path: `/place/${place.slug}`,
    image: shareImageForCity(place.city),
  });
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = placeBySlug(slug);
  if (!place) notFound();

  const city = cityRecordFor(place.city, place.country);
  const country = countriesOnFile().find((item) => item.country === place.country);
  const pin = pinForName(place.city, place.name);
  const related = placesOnFile()
    .filter(
      (item) =>
        item.slug !== place.slug &&
        item.city === place.city &&
        item.country === place.country,
    )
    .slice(0, 8);
  const path = `/place/${place.slug}`;
  const catPath = `/categories/${categorySlug(place.category)}`;

  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-36 lg:pb-20">
      <JsonLd data={listedPlaceJsonLd(place)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Places", path: "/places" },
          ...(country
            ? [{ name: country.country, path: `/countries/${country.slug}` }]
            : []),
          ...(city ? [{ name: city.city, path: `/cities/${city.slug}` }] : []),
          { name: place.name, path },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Places", href: "/places" },
          ...(city ? [{ name: city.city, href: `/cities/${city.slug}` }] : []),
          { name: place.name },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">
        {place.category}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight sm:text-6xl">
        {place.name}
      </h1>
      <p className="mt-4 text-sm text-ink">
        {place.city}, {place.country}
      </p>
      <p className="mt-6 text-base leading-8 text-ink">{placeDescription(place)}</p>
      {pin ? (
        <p className="mt-4 text-sm leading-7 text-muted">
          Sourced map coordinates are on file for this name.
          {" "}
          <Link href="/map" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Open the map
          </Link>
        </p>
      ) : null}
      <div className="mt-8 flex flex-col items-start gap-3">
        <a
          href={place.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-chart"
        >
          Organiser page — leaves this site
        </a>
        <Link
          href={catPath}
          className="text-sm underline decoration-ink/30 underline-offset-4 hover:text-oxide"
        >
          More {place.category.toLowerCase()}
        </Link>
      </div>

      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl tracking-tight">Also in {place.city}</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/place/${item.slug}`}
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  {item.name}
                </Link>
                <span className="text-muted"> — {item.category}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-sm leading-7 text-muted">
        {city ? (
          <>
            <Link
              href={`/cities/${city.slug}`}
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              {city.city}
            </Link>
            {" · "}
          </>
        ) : null}
        <Link href="/west-africa" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          West Africa
        </Link>
        {" · "}
        <Link href="/places" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Places
        </Link>
        {" · "}
        <Link href="/detty-december" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Detty December
        </Link>
      </p>
      <p className="mt-6 max-w-xl text-sm leading-7 text-muted">{disclaimer}</p>
    </main>
  );
}
