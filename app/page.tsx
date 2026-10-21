import { Suspense } from "react";
import { EventsSection } from "./components/events-section";
import { FlightsSection } from "./components/flights-section";
import { MapSection } from "./components/map-section";
import { PlacesFallback, PlacesSection } from "./components/places-section";

const nav = [
  ["Events", "#events"],
  ["Places", "#places"],
  ["Flights", "#flights"],
  ["Map", "#map"],
] as const;

export default function Home() {
  return (
    <>
      <a
        href="#events"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to events
      </a>
      <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper/95 shadow-[0_4px_0_0_#9e301c] backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 md:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border border-ink font-display text-lg italic leading-none">
              Dc
            </span>
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
                Directory
              </span>
              <span className="block font-display text-xl leading-none tracking-tight">
                December Circuit
              </span>
            </span>
          </a>
          <nav aria-label="Sections" className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {nav.map(([label, href]) => (
              <a key={href} href={href} className="underline-offset-4 hover:underline">
                {label}
              </a>
            ))}
          </nav>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Checked 21 October 2026
          </p>
        </div>
      </header>
      <main id="top">
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-12 pt-12 md:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.72fr)] md:px-8 md:pb-16 md:pt-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brass">
              December 2026
            </p>
            <h1 className="mt-4 font-display text-[clamp(3.75rem,11vw,7.5rem)] leading-[0.84] tracking-[-0.045em]">
              <span className="block">December</span>
              <span className="block italic text-oxide">Circuit</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8">
              Confirmed events for December 2026. Dates below come from the
              organiser or a named news report, checked on 21 October 2026.
            </p>
          </div>
          <aside className="self-end border border-ink bg-paper-deep px-5 py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">
              What gets listed
            </p>
            <dl className="mt-4 space-y-3 text-sm leading-6">
              <div className="border-t border-line pt-3">
                <dt className="font-medium">Events</dt>
                <dd className="text-muted">Organiser, or a named news report.</dd>
              </div>
              <div className="border-t border-line pt-3">
                <dt className="font-medium">Places</dt>
                <dd className="text-muted">The name opens the organiser page.</dd>
              </div>
              <div className="border-t border-line pt-3">
                <dt className="font-medium">Flights</dt>
                <dd className="text-muted">A search link. Not a fare or a seat.</dd>
              </div>
              <div className="border-t border-line pt-3">
                <dt className="font-medium">Map</dt>
                <dd className="text-muted">
                  A pin only where a coordinate is already on file.
                </dd>
              </div>
            </dl>
          </aside>
        </section>
        <EventsSection />
        <Suspense fallback={<PlacesFallback />}>
          <PlacesSection />
        </Suspense>
        <FlightsSection />
        <MapSection />
      </main>
      <footer className="mt-4 border-t-2 border-ink">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <p className="font-display text-3xl tracking-tight">December Circuit</p>
            <p className="mt-2 max-w-md leading-7 text-muted">
              Booking stays on each organiser&apos;s own site. A flight row opens
              a search.
            </p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Checked 21 October 2026
          </p>
        </div>
      </footer>
      <noscript>
        <p className="mx-auto max-w-6xl px-5 pb-10 text-sm leading-6 text-muted md:px-8">
          December Circuit loads events, places, flight searches, and the map
          from this site. JavaScript is required to read those lists.
        </p>
      </noscript>
    </>
  );
}
