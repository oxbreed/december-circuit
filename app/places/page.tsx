import { Suspense } from "react";
import { PlacesFallback, PlacesSection } from "../components/places-section";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Places",
  description:
    "Open a listed business’s own page by country, city, and category. Add a missing place from List a place for review.",
  path: "/places",
});

export default function PlacesPage() {
  return (
    <main id="top" className="pb-28 lg:pb-0">
      <Suspense fallback={<PlacesFallback />}>
        <PlacesSection />
      </Suspense>
    </main>
  );
}
