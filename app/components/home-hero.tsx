import Link from "next/link";
import { heroStagePosters } from "../home-hero-slides";
import { HeroCarousel } from "./hero-carousel";

const actionClass =
  "inline-flex min-h-11 items-center justify-center px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-chart";

/**
 * Homepage hero: heading, copy and buttons on a blurred, ink-graded copy of the current poster
 * (edge to edge), with the sharp poster as its own 4:5 card beside them. The slides come from
 * `HERO_POSTER_SLIDES` in home-hero-slides.ts. Text never sits over the artwork.
 */
export function HomeHero() {
  const posters = heroStagePosters();
  return (
    <section
      className="relative isolate overflow-x-clip pt-[4.5rem] text-chart lg:pt-[8.25rem]"
      aria-labelledby="home-hero-heading"
    >
      <HeroCarousel
        posters={posters}
        intro={
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f8c999]">Independent West Africa directory</p>
            <h1
              id="home-hero-heading"
              className="mt-3 max-w-xl text-balance font-display text-[2.4rem] leading-[1.02] tracking-tight text-chart sm:text-5xl lg:text-6xl"
            >
              Your guide to Detty <span className="italic text-[#f4a58c]">December</span>
            </h1>
            <p className="mt-3 max-w-md text-base leading-7 text-chart/90 sm:mt-4">
              Find concerts and festivals, discover where to stay and eat, and plan your trip across West Africa.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
              <Link href="/events" className={`${actionClass} bg-oxide text-chart hover:bg-oxide-deep`}>
                Browse events
              </Link>
              <Link
                href="/places"
                className={`${actionClass} border border-chart/55 bg-ink/30 text-chart hover:bg-chart hover:text-ink`}
              >
                Explore places
              </Link>
            </div>
            <nav aria-label="Trip planning shortcuts" className="mt-4 hidden flex-wrap items-center gap-x-5 gap-y-1 text-sm text-chart sm:flex">
              <Link
                href="/guides"
                className="inline-flex min-h-10 items-center underline decoration-chart/45 underline-offset-4 hover:decoration-chart"
              >
                Travel guides
              </Link>
              <Link
                href="#trip"
                className="inline-flex min-h-10 items-center underline decoration-chart/45 underline-offset-4 hover:decoration-chart"
              >
                My trip
              </Link>
            </nav>
          </div>
        }
      />
    </section>
  );
}
