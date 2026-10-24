import Link from "next/link";
import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import { MapSection } from "../components/map-section";
import { breadcrumbJsonLd } from "../jsonld";
import { pins } from "../pins";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Map — Lagos, Accra, Calabar & West Africa",
  description:
    "Sourced map pins for Detty December and West Africa places already on file — OpenStreetMap coordinates for Lagos, Accra, Calabar, and other listed cities. Directions leave this site.",
  path: "/map",
});

export default function MapPage() {
  const sample = pins.slice(0, 40);

  return (
    <main id="top" className="pb-28 lg:pb-0">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Map", path: "/map" },
        ])}
      />
      <div className="mx-auto w-full max-w-6xl px-5 pt-28 md:px-8 md:pt-36">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Map" },
          ]}
        />
        <section aria-label="Places with coordinates" className="mt-6 pb-4">
          <h2 className="sr-only">Places with sourced coordinates</h2>
          <ul className="columns-1 gap-x-8 text-sm leading-6 text-ink sm:columns-2 lg:columns-3">
            {sample.map((pin) => (
              <li
                key={`${pin.city}-${pin.name}-${pin.latitude}-${pin.longitude}`}
                className="break-inside-avoid py-0.5"
              >
                <span className="text-ink">{pin.name}</span>
                <span className="text-muted">
                  {" "}
                  — {pin.city}, {pin.country}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            <Link href="/explore" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              Explore map search
            </Link>
            {" · "}
            <Link href="/cities" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              Cities
            </Link>
            {" · "}
            <Link href="/places" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              Organiser pages
            </Link>
          </p>
        </section>
      </div>
      <MapSection />
    </main>
  );
}
