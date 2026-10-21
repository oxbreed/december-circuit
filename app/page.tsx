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
  ["About", "#about"],
] as const;

const disclaimer =
  "Independent community directory. Not affiliated with Livespot360 or Detty December Fest™.";

function PalmMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M12 21V10" />
      <path d="M12 11c-2-4-6-5-8-4 2 2 4 3 8 4Z" />
      <path d="M12 10c2-4 6-6 8-5-2 2-4 4-8 5Z" />
      <path d="M12 12c-3-2-5-1-7 1 2 1 4 1 7-1Z" />
      <path d="M12 12c3-2 6-1 8 1-3 1-5 1-8-1Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <a
        href="#events"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to events
      </a>
      <header className="sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-gold/30 bg-[rgba(8,10,16,0.72)] px-4 py-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl md:px-6">
          <a href="#top" className="flex items-center gap-2 text-sm tracking-wide text-gold">
            <PalmMark />
            <span>
              dirtydecember<span className="text-gold/70">.info</span>
            </span>
          </a>
          <nav aria-label="Sections" className="hidden items-center gap-6 lg:flex">
            {nav.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-[11px] uppercase tracking-[0.22em] text-mist/80 hover:text-gold"
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href="#events"
            className="hidden rounded-full border border-gold/70 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-gold lg:inline-flex"
          >
            Explore the guide
          </a>
        </div>
      </header>
      <main id="top" className="pb-24 lg:pb-0">
        <section className="mx-auto mt-4 w-full max-w-6xl px-3 md:px-6">
          <div className="relative min-h-[78vh] overflow-hidden rounded-[1.6rem] border border-gold/20 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:min-h-[640px]">
            <img
              src="/hero-lagos-night.jpg"
              alt="Illuminated bridge and city skyline at night"
              className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="relative flex min-h-[78vh] flex-col justify-end px-6 py-10 md:min-h-[640px] md:justify-center md:px-12 md:py-16">
              <h1 className="max-w-xl font-display text-[clamp(4.4rem,12vw,7.6rem)] leading-[0.86] tracking-tight text-[#e7d3a1]">
                Detty
                <span className="block">December</span>
              </h1>
              <p className="mt-5 max-w-md text-xl leading-8 text-white/90 md:text-2xl">
                The definitive guide to Lagos nights
              </p>
              <a
                href="#events"
                className="mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-gold/80 bg-black/25 px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm"
              >
                Explore the guide
                <span aria-hidden="true">→</span>
              </a>
              <p className="mt-8 max-w-xl text-xs leading-5 text-white/75 md:mt-12">
                {disclaimer}
              </p>
            </div>
          </div>
        </section>
        <EventsSection />
        <Suspense fallback={<PlacesFallback />}>
          <PlacesSection />
        </Suspense>
        <FlightsSection />
        <MapSection />
        <section id="about" className="scroll-mt-28 mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="flex items-center gap-4">
            <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-brass">
              About
            </p>
            <span className="h-px flex-1 bg-gradient-to-r from-brass/70 to-transparent" />
          </div>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-none tracking-tight md:text-6xl">
            An independent directory
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted">{disclaimer}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <p className="rounded-3xl border border-gold/25 bg-paper-deep/80 p-6 leading-7 text-mist shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              Confirmed events for December 2026. Dates below come from the
              organiser or a named news report, checked on 21 October 2026.
              Cities outside Lagos stay on the list.
            </p>
            <p className="rounded-3xl border border-gold/25 bg-paper-deep/80 p-6 leading-7 text-mist shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              A place name opens that organiser page. A flight row opens a
              search, not a fare or a seat. The map uses the coordinates already
              on file, and directions leave this site.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t border-line pb-24 lg:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <p className="font-display text-3xl text-gold">dirtydecember.info</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">{disclaimer}</p>
          </div>
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-muted">
            Checked 21 October 2026
          </p>
        </div>
      </footer>
      <nav
        aria-label="Mobile sections"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-gold/30 bg-[rgba(8,10,16,0.78)] px-1 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden"
      >
        {nav.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="px-1 py-1 text-center text-[9px] uppercase tracking-[0.12em] text-mist/80"
          >
            {label}
          </a>
        ))}
      </nav>
      <noscript>
        <p className="mx-auto max-w-6xl px-5 pb-10 text-sm leading-6 text-muted md:px-8">
          This directory loads events, places, flight searches, and the map from
          this site. JavaScript is required to read those lists.
        </p>
      </noscript>
    </>
  );
}
