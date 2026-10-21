import type { Metadata } from "next";
import { MapSection } from "../components/map-section";

export const metadata: Metadata = {
  title: "Map · dirtydecember.info",
  description: "Sourced coordinates on an OpenStreetMap.",
};

export default function MapPage() {
  return (
    <main id="top" className="pb-28 lg:pb-0">
      <MapSection />
    </main>
  );
}
