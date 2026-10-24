import Link from "next/link";
import { Suspense } from "react";
import { citiesOnFile } from "../cities";
import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import { PlacesFallback, PlacesSection } from "../components/places-section";
import { breadcrumbJsonLd } from "../jsonld";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Places & organiser pages",
  description:
    "Organiser and business pages across West Africa — Lagos, Accra, Calabar, and cities on file — by country, city, and category. Outbound links only; list a missing place for review.",
  path: "/places",
});

export default function PlacesPage() {
  const cities = citiesOnFile().slice(0, 24);

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
        <nav aria-label="Cities with organiser pages" className="mt-6 pb-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">
            Browse by city
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm leading-6 text-ink">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/cities/${city.slug}`}
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  {city.city}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/cities"
                className="text-oxide underline decoration-oxide/40 underline-offset-4"
              >
                All cities →
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <Suspense fallback={<PlacesFallback />}>
        <PlacesSection />
      </Suspense>
    </main>
  );
}
