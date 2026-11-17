import Link from "next/link";
import { disclaimer } from "../brand";
import { HeroNightlife } from "./hero-nightlife";

const offerLink =
  "inline-flex items-center justify-center px-2 py-2.5 text-center text-[10px] uppercase tracking-[0.12em] sm:px-5 sm:py-3 sm:text-[11px] sm:tracking-[0.18em]";

export function HomeHero() {
  return (
    <section className="overflow-x-clip border-b border-ink/10 pt-[4.5rem] lg:pt-[8.25rem]" aria-labelledby="home-hero-heading">
      <HeroNightlife />
      <div className="mx-auto max-w-6xl px-4 pb-5 pt-3 sm:px-6 sm:pb-8 sm:pt-4 lg:px-8 lg:pb-8 lg:pt-4">
        <p className="text-[11px] uppercase tracking-[0.32em] text-lagoon">dirtydecember.info</p>
        <h1
          id="home-hero-heading"
          className="mt-2 max-w-3xl font-display text-[1.85rem] leading-[1.05] tracking-tight text-ink sm:mt-3 sm:text-5xl lg:text-[2.9rem]"
        >
          Independent directory for Detty December &amp; West Africa
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:mt-4 sm:text-base sm:leading-7 lg:mt-3">
          Events, places (hotels, restaurants, clubs, short stays), season guides, and visa — all from sourced
          pages. Booking always leaves this site. {disclaimer}
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:mt-5 sm:flex sm:flex-wrap sm:items-center lg:mt-4">
          <Link href="/events" className={`${offerLink} bg-oxide text-chart`}>
            Events
          </Link>
          <Link href="/places" className={`${offerLink} border border-ink/25 bg-chart text-ink`}>
            Places
          </Link>
          <Link href="/guides" className={`${offerLink} border border-ink/25 bg-chart text-ink`}>
            Guides
          </Link>
          <Link href="/visa" className={`${offerLink} border border-ink/25 bg-chart text-ink`}>
            Visa
          </Link>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted sm:mt-4">
          <Link href="#start-here" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Jump to category hubs
          </Link>
          {" · "}
          <Link href="/guide" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Tourist guide
          </Link>
        </p>
      </div>
    </section>
  );
}
