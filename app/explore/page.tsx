import { Suspense } from "react";
import { ExploreFallback, ExploreSection } from "../components/explore-section";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Explore map search",
  description:
    "Search OpenStreetMap for hotels, restaurants, clubs, and landmarks in Lagos, Accra, and Calabar. Map data — not a checked listing.",
  path: "/explore",
});

export default function ExplorePage() {
  return (
    <main id="top" className="pb-28 lg:pb-0">
      <Suspense fallback={<ExploreFallback />}>
        <ExploreSection />
      </Suspense>
    </main>
  );
}
