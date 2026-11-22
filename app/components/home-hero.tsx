import Link from "next/link";
import { heroStagePosters } from "../home-hero-slides";
import { HeroBackground } from "./hero-background";
import { HeroStage } from "./hero-stage";

const actionClass =
  "inline-flex min-h-11 items-center justify-center px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

export function HomeHero() {
  const poster = heroStagePosters()[0];
  return (
    <section
      className="relative isolate overflow-x-clip pt-[4.5rem] lg:pt-[8.25rem]"
      aria-labelledby="home-hero-heading"
    >
      <HeroBackground poster={poster} />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12 lg:px-8 lg:py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-oxide">Independent West Africa directory</p>
          <h1
            id="home-hero-heading"
            className="mt-3 max-w-xl text-balance font-display text-[2.4rem] leading-[1.02] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Your guide to Detty <span className="italic text-oxide">December</span>
          </h1>
          <p className="mt-3 max-w-md text-base leading-7 text-muted sm:mt-4">
            Find concerts and festivals, discover where to stay and eat, and plan your trip across West Africa.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
            <Link href="/events" className={`${actionClass} bg-oxide text-chart`}>
              Browse events
            </Link>
            <Link href="/places" className={`${actionClass} border border-ink/25 bg-chart text-ink hover:text-oxide`}>
              Explore places
            </Link>
          </div>
          <nav aria-label="Trip planning shortcuts" className="mt-4 hidden flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink sm:flex">
            <Link href="/guides" className="inline-flex min-h-10 items-center underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              Travel guides
            </Link>
            <Link href="#trip" className="inline-flex min-h-10 items-center underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              My trip
            </Link>
          </nav>
        </div>
        {poster ? <HeroStage poster={poster} /> : null}
      </div>
    </section>
  );
}
