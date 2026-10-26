import Link from "next/link";
import { disclaimer } from "../brand";

export function HomeHero() {
  return (
    <section className="overflow-x-clip border-b border-ink/10 px-4 pb-10 pt-[4.5rem] sm:px-6 lg:px-8 lg:pb-14 lg:pt-[8.25rem]">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-lagoon">
          dirtydecember.info
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-[2.15rem] leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
          Independent directory for Detty December &amp; West Africa
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Sourced events, places, and trip planning — booking always leaves this site.{" "}
          {disclaimer}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/events"
            className="inline-flex justify-center bg-oxide px-5 py-3 text-center text-[11px] uppercase tracking-[0.18em] text-chart"
          >
            Browse confirmed events
          </Link>
          <Link
            href="/places"
            className="inline-flex justify-center border border-ink/25 bg-chart px-5 py-3 text-center text-[11px] uppercase tracking-[0.18em] text-ink hover:border-oxide hover:text-oxide"
          >
            Explore places
          </Link>
        </div>
        <p className="mt-5">
          <Link
            href="/guide"
            className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            Plan your trip / Tourist guide
          </Link>
        </p>
      </div>
    </section>
  );
}
