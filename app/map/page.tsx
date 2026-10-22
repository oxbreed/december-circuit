import { MapSection } from "../components/map-section";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Map",
  description: "Sourced coordinates on an OpenStreetMap.",
  path: "/map",
});

export default function MapPage() {
  return (
    <main id="top" className="pb-28 lg:pb-0">
      <MapSection />
    </main>
  );
}
