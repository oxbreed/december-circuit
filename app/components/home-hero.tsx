import Link from "next/link";
import { disclaimer } from "../brand";
import { defaultShareImage } from "../site";
import { RecordImage } from "./record-image";

export function HomeHero() {
  return (
    <section className="overflow-x-clip border-b border-ink/10 px-4 pb-10 pt-[4.5rem] sm:px-6 lg:px-8 lg:pb-14 lg:pt-[8.25rem]">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,480px)] lg:items-end">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.32em] text-lagoon">dirtydecember.info</p>
          <h1 className="mt-3 max-w-3xl font-display text-[2.15rem] leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">Independent directory for Detty December &amp; West Africa</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Events, places (hotels, restaurants, clubs, short stays), season guides, and visa — all from
            sourced pages. Booking always leaves this site. {disclaimer}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/events"
              className="inline-flex justify-center bg-oxide px-5 py-3 text-center text-[11px] uppercase tracking-[0.18em] text-chart"
            >
              Events
            </Link>
            <Link
              href="/places"
              className="inline-flex justify-center border border-ink/25 bg-chart px-5 py-3 text-center text-[11px] uppercase tracking-[0.18em] text-ink"
            >
              Places
            </Link>
            <Link
              href="/guides"
              className="inline-flex justify-center border border-ink/25 bg-chart px-5 py-3 text-center text-[11px] uppercase tracking-[0.18em] text-ink"
            >
              Guides
            </Link>
            <Link
              href="/visa"
              className="inline-flex justify-center border border-ink/25 bg-chart px-5 py-3 text-center text-[11px] uppercase tracking-[0.18em] text-ink"
            >
              Visa
            </Link>
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">
            <Link href="#start-here" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              Jump to category hubs
            </Link>
            {" · "}
            <Link href="/guide" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              Tourist guide
            </Link>
          </p>
        </div>
        <figure className="min-w-0">
          <RecordImage image={defaultShareImage} priority sizes="(max-width: 1024px) 100vw, 480px" className="aspect-[16/10] h-auto w-full border border-ink/15 object-cover" />
        </figure>
      </div>
    </section>
  );
}
