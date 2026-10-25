import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { disclaimer } from "../../brand";
import { cityRecordFor } from "../../cities";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { JsonLd } from "../../components/json-ld";
import {
  categoryIndex,
  categoryIndexBySlug,
  exploreKindLabel,
} from "../../explore-categories";
import {
  breadcrumbJsonLd,
  categoryPlacesItemListJsonLd,
} from "../../jsonld";
import { placesInCategory } from "../../place-catalog";
import { poiCities } from "../../poi-client";
import { pageMetadata } from "../../site";
import { shareImageForCity } from "../../share-images";

export function generateStaticParams() {
  return categoryIndex().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = categoryIndexBySlug(slug);
  if (!cat) return { title: "Category" };
  const exploreBit = cat.exploreKind
    ? ` OpenStreetMap Explore search for ${exploreKindLabel(cat.exploreKind).toLowerCase()} in Lagos, Accra, and Calabar.`
    : "";
  const countBit =
    cat.count > 0
      ? `${cat.count} sourced ${cat.category.toLowerCase()} organiser pages across West Africa cities on dirtydecember.info.`
      : `${cat.category} on dirtydecember.info — map / third-party Explore data for Lagos, Accra, and Calabar; curated organiser rows only when sourced.`;
  return pageMetadata({
    title: `${cat.category} in West Africa`,
    description: `${countBit}${exploreBit} Outbound links only; no prices or ratings invented here.`,
    path: `/categories/${cat.slug}`,
    image: shareImageForCity("Lagos"),
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categoryIndexBySlug(slug);
  if (!cat) notFound();
  const listed = cat.count > 0 ? placesInCategory(cat.category) : [];
  const path = `/categories/${cat.slug}`;

  return (
    <main id="top" className="mx-auto w-full max-w-6xl px-5 pb-28 pt-28 md:px-8 md:pt-36 lg:pb-16">
      {listed.length > 0 ? (
        <JsonLd data={categoryPlacesItemListJsonLd(cat.category, path, listed)} />
      ) : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "West Africa", path: "/west-africa" },
          { name: cat.category, path },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "West Africa", href: "/west-africa" },
          { name: cat.category },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">Category</p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">
        {cat.category}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
        {cat.blurb
          ? cat.blurb
          : cat.count > 0
            ? `${cat.count} organiser ${cat.count === 1 ? "page" : "pages"} already listed. Opening a name leaves this site.`
            : "No curated organiser pages on file for this category yet."}{" "}
        {disclaimer}
      </p>

      {cat.exploreKind ? (
        <section className="mt-8 border border-brass/40 bg-paper-deep/50 px-4 py-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
            Explore map search
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink">
            OpenStreetMap (optional Google / Foursquare when configured) for{" "}
            {exploreKindLabel(cat.exploreKind).toLowerCase()} in Lagos, Accra, and Calabar.
            Map / third-party data — not checked directory rows. No phones, prices, or ratings
            invented here.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-6">
            {poiCities.map((city) => (
              <li key={city}>
                <Link
                  href={`/explore?city=${encodeURIComponent(city)}&kind=${cat.exploreKind}`}
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  {city} on Explore
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/explore?kind=${cat.exploreKind}`}
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                All Explore cities
              </Link>
            </li>
          </ul>
        </section>
      ) : null}

      {listed.length > 0 ? (
        <>
          <h2 className="mt-12 font-display text-3xl tracking-tight">
            Organiser pages on file
          </h2>
          <ul className="mt-6 divide-y divide-ink/10 border border-ink/15 bg-chart">
            {listed.map((place) => {
              const city = cityRecordFor(place.city, place.country);
              return (
                <li
                  key={place.slug}
                  className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                      {place.city}, {place.country}
                    </p>
                    <Link
                      href={`/place/${place.slug}`}
                      className="mt-1 block font-display text-2xl leading-none tracking-tight hover:text-oxide"
                    >
                      {place.name}
                    </Link>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-1 text-sm sm:items-end">
                    <Link
                      href={`/place/${place.slug}`}
                      className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                    >
                      On this site
                    </Link>
                    {city ? (
                      <Link
                        href={`/cities/${city.slug}`}
                        className="text-muted underline decoration-ink/20 underline-offset-4 hover:text-oxide"
                      >
                        {city.city} page
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="mt-10 max-w-2xl text-sm leading-7 text-muted">
          Curated{" "}
          <Link href="/places" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Places
          </Link>{" "}
          rows are not invented for this hub. Use Explore above for map data, or{" "}
          <Link href="/list#submit-place" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            list a place
          </Link>{" "}
          for human review when you have an organiser page.
        </p>
      )}

      <p className="mt-10 text-sm leading-7 text-muted">
        <Link href="/west-africa" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          West Africa hub
        </Link>
        {" · "}
        <Link href="/places" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          All places
        </Link>
        {" · "}
        <Link href="/explore" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Explore
        </Link>
        {" · "}
        <Link href="/cities" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Cities
        </Link>
      </p>
    </main>
  );
}
