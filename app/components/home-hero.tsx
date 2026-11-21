import Link from "next/link";
import { homeHeroSlides } from "../home-hero-slides";
import { HeroNightlife } from "./hero-nightlife";
import { HeroSlideCaption, HeroSlideImage } from "./hero-slide";

const actionClass =
  "inline-flex min-h-11 items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

export function HomeHero() {
  const slides = homeHeroSlides();
  const firstSlide = slides[0];
  return (
    <section
      className="overflow-x-clip border-b border-ink/10 bg-paper pt-[4.5rem] lg:pt-[8.25rem]"
      aria-labelledby="home-hero-heading"
    >
      <div className="mx-auto grid max-w-6xl gap-7 px-4 py-7 sm:px-6 sm:py-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-oxide">Independent West Africa directory</p>
          <h1
            id="home-hero-heading"
            className="mt-3 max-w-xl text-balance font-display text-[2.4rem] leading-[1.02] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Your guide to Detty December
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-muted">
            Find concerts and festivals, discover where to stay and eat, and plan your trip across West Africa.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/events" className={`${actionClass} bg-oxide text-chart`}>
              Browse events
            </Link>
            <Link href="/places" className={`${actionClass} border border-ink/25 bg-chart text-ink hover:text-oxide`}>
              Explore places
            </Link>
          </div>
          <nav aria-label="Trip planning shortcuts" className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink">
            <Link href="/guides" className="inline-flex min-h-10 items-center underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              Travel guides
            </Link>
            <Link href="#trip" className="inline-flex min-h-10 items-center underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              My trip
            </Link>
          </nav>
        </div>
        {firstSlide && (
          <HeroNightlife
            count={slides.length}
            firstImage={<HeroSlideImage slide={firstSlide} first />}
            firstCaption={<HeroSlideCaption slide={firstSlide} />}
          />
        )}
      </div>
    </section>
  );
}
