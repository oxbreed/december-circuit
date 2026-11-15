"use client";

import Link from "next/link";
import type { CircuitEvent } from "../events";
import { presentEvent } from "../event-view";
import { cardImageForEvent } from "../share-images";
import { eventTripId } from "../trip";
import { DateBlock } from "./event-card";
import { LoadMoreList } from "./load-more";
import { RecordImage } from "./record-image";
import { SaveTripButton } from "./save-trip-button";

function MajorCard({ event }: { event: CircuitEvent }) {
  const view = presentEvent(event);
  const image = cardImageForEvent(event);
  return (
    <article className="flex flex-col border border-ink/15 bg-chart">
      {image ? <RecordImage image={image} sizes="(max-width: 768px) 100vw, 720px" className="aspect-[16/9] h-auto w-full border-b border-ink/10 object-cover" /> : null}
      <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
        <DateBlock when={event.when} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">{view.category}</p>
          <h3 className="mt-2 font-display text-3xl leading-none tracking-tight"><Link href={view.href} className="hover:text-oxide">{view.name}</Link></h3>
          <p className="mt-3 text-sm text-ink">{view.region}</p>
          {view.venue ? <p className="mt-1 text-sm text-muted">{view.venue}</p> : null}
        </div>
      </div>
      <div className="flex flex-col items-start gap-4 border-t border-ink/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {event.url ? <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">{event.urlLabel ?? "Organiser page"} — leaves this site</a> : <p className="text-sm text-muted">No organiser page listed</p>}
        <SaveTripButton kind="event" id={eventTripId(event)} />
      </div>
    </article>
  );
}

export function MajorsLoadMore({ events }: { events: CircuitEvent[] }) {
  if (events.length === 0) return null;
  return (
    <LoadMoreList items={events} mobileSize={1} desktopSize={2} noun="major events">
      {(visible) => (
        <div className="mt-4 grid gap-5">
          {visible.map((event) => <MajorCard key={`${event.region}-${event.when}-${event.summary}`} event={event} />)}
        </div>
      )}
    </LoadMoreList>
  );
}
