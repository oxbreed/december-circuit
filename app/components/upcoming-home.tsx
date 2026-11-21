import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { presentEvent } from "../event-view";
import { upcomingEventsFrom } from "../upcoming-events";
import { LoadingLines } from "./states";
import { UpcomingHomeList } from "./upcoming-home-list";

async function UpcomingBody() {
  await connection();
  const rows = upcomingEventsFrom(new Date()).slice(0, 5).map((event) => {
    const { href, name, region } = presentEvent(event);
    return { href, name, region, when: event.when };
  });
  return <UpcomingHomeList rows={rows} />;
}

export function UpcomingHome() {
  return (
    <section id="upcoming" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Event calendar</p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">Upcoming events</h2>
          </div>
          <Link href="/events" className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide">See all events</Link>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">The next five events on the calendar.</p>
        <Suspense fallback={<div className="mt-6"><LoadingLines /></div>}><UpcomingBody /></Suspense>
      </div>
    </section>
  );
}
