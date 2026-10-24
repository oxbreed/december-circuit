import { Suspense } from "react";
import { PlacesFallback, PlacesSection } from "../components/places-section";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Places",
  description: "Organiser pages already listed, by country, city, and category.",
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
