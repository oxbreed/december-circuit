import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "../components/breadcrumbs";
import { ExploreFallback, ExploreSection } from "../components/explore-section";
import { JsonLd } from "../components/json-ld";
import { breadcrumbJsonLd } from "../jsonld";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Explore map search — Lagos, Accra, Calabar",
  description:
    "Search OpenStreetMap (optional Foursquare) for hotels, restaurants, clubs, and landmarks in Lagos, Accra, and Calabar. Third-party venue data for vacation planning — not a checked DirtyDecember listing.",
  path: "/explore",
});

export default function ExplorePage() {
  return (
    <main id="top" className="pb-28 lg:pb-0">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explore", path: "/explore" },
        ])}
      />
      <div className="mx-auto w-full max-w-6xl px-5 pt-28 md:px-8 md:pt-36">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Explore" },
          ]}
        />
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Map search for parties, stays, and landmarks around Detty December hubs. Results are
          OpenStreetMap or Foursquare data — not the checked organiser list. Prefer{" "}
          <Link href="/places" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Places
          </Link>{" "}
          and{" "}
          <Link href="/map" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Map
          </Link>{" "}
          for sourced pins.
        </p>
      </div>
      <Suspense fallback={<ExploreFallback />}>
        <ExploreSection />
      </Suspense>
    </main>
  );
}
