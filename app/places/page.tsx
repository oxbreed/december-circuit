import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import { PlacesDirectory } from "../components/places-directory";
import { LoadingLines } from "../components/states";
import { breadcrumbJsonLd } from "../jsonld";
import { placesOnFile } from "../place-catalog";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Places & organiser pages",
  description:
    "Organiser and business pages across West Africa — Lagos, Accra, Calabar, and cities on file — by country, city, and category. Outbound links only; list a missing place for review.",
  path: "/places",
});

export default function PlacesPage() {
  const crawlPlaces = placesOnFile();

  return (
    <main id="top" className="pb-28 lg:pb-0">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Places", path: "/places" },
        ])}
      />
      <div className="mx-auto w-full max-w-6xl px-5 pt-28 md:px-8 md:pt-36">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Places" },
          ]}
        />
      </div>

      {/* Crawlable index — always in HTML for search and answer engines */}
      <section
        aria-label="Organiser pages on file"
        className="mx-auto w-full max-w-6xl px-5 pb-2 md:px-8"
      >
        <h2 className="sr-only">Organiser pages on file</h2>
        <ul className="sr-only">
          {crawlPlaces.map((place) => (
            <li key={place.slug}>
              <Link href={`/place/${place.slug}`}>{place.name}</Link>
              <span>
                {" "}
                — {place.city}, {place.country}, {place.category}
              </span>
            </li>
          ))}
        </ul>
        <p className="sr-only">
          <Link href="/cities">Cities</Link>
          {" · "}
          <Link href="/west-africa">West Africa</Link>
          {" · "}
          <Link href="/explore">Explore map search</Link>
          {" · "}
          <Link href="/list">List a place</Link>
        </p>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-5 pt-8">
            <LoadingLines label="Loading places" />
          </div>
        }
      >
        <PlacesDirectory />
      </Suspense>
    </main>
  );
}
