import type { Metadata } from "next";
import { Suspense } from "react";
import { PlacesFallback, PlacesSection } from "../components/places-section";

export const metadata: Metadata = {
  title: "Places · dirtydecember.info",
  description: "Organiser pages already on file, by country, city, and category.",
};

export default function PlacesPage() {
  return (
    <main id="top" className="pb-24 pt-8 lg:pb-0">
      <Suspense fallback={<PlacesFallback />}>
        <PlacesSection />
      </Suspense>
    </main>
  );
}
