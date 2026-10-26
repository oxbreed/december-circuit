import Link from "next/link";
import { events, type CircuitEvent } from "../events";
import { presentEvent } from "../event-view";
import { eventTripId } from "../trip";
import { DateBlock } from "./event-card";
import { SaveTripButton } from "./save-trip-button";

/**
 * Major season headlines only — resolved from existing sourced rows by sourceId
 * (and when needed, the season-span Carnival row). Never invents events.
 */
const featuredKeys: ReadonlyArray<{ sourceId: string; when?: string }> = [
  { sourceId: "oriade-residency" },
  { sourceId: "detty-december-fest" },
  { sourceId: "flytime-fest-home", when: "22-24 December" },
  { sourceId: "rhythm-unplugged-stylerave" },
  { sourceId: "carnival-calabar", when: "26-30 December" },
  { sourceId: "december-in-ghana-myjoy" },
];

function featuredEvents(): CircuitEvent[] {
  const rows: CircuitEvent[] = [];
  for (const key of featuredKeys) {
    const match = events.find(
      (event) =>
        event.sourceId === key.sourceId &&
        (key.when === undefined || event.when === key.when),
    );
    if (match) rows.push(match);
  }
  return rows.slice(0, 6);
}

function FeaturedCard({ event }: { event: CircuitEvent }) {
  const view = presentEvent(event);

  return (
    <article className="flex flex-col border border-ink/15 bg-chart shadow-[4px_4px_0_0_rgba(184,67,47,0.12)]">
      <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
        <DateBlock when={event.when} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
            <Link href={view.href} className="hover:text-oxide">
              {view.name}
            </Link>
          </h3>
          <p className="mt-3 text-sm text-ink">{view.region}</p>
        </div>
      </div>
      <div className="border-t border-ink/10 px-5 py-4 sm:px-6">
        <SaveTripButton kind="event" id={eventTripId(event)} />
      </div>
    </article>
  );
}

export function FeaturedSeason() {
  const featured = featuredEvents();

  return (
    <section id="featured" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">
          December 2026
        </p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
          Featured this season
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Major confirmed nights and festivals already on file. Save any card to My trip in this
          browser — tickets and organiser pages stay outbound.
        </p>
        {featured.length === 0 ? (
          <p className="mt-6 text-sm leading-7 text-muted">
            No featured events are listed yet.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {featured.map((event) => (
              <FeaturedCard
                key={`${event.region}-${event.when}-${event.summary}`}
                event={event}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
