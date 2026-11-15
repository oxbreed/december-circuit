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

function FeaturedCard({ event }: { event: CircuitEvent }) {
  const view = presentEvent(event);
  const image = cardImageForEvent(event);
  return (
    <article className="flex flex-col border border-ink/15 bg-chart">
      {image ? <RecordImage image={image} sizes="(max-width: 768px) 100vw, 50vw" className="aspect-[16/9] h-auto w-full border-b border-ink/10 object-cover" /> : null}
      <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
        <DateBlock when={event.when} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-3xl leading-none tracking-tight"><Link href={view.href} className="hover:text-oxide">{view.name}</Link></h3>
          <p className="mt-3 text-sm text-ink">{view.region}</p>
        </div>
      </div>
      <div className="border-t border-ink/10 px-5 py-4"><SaveTripButton kind="event" id={eventTripId(event)} /></div>
    </article>
  );
}

export function FeaturedSeasonGrid({ featured }: { featured: CircuitEvent[] }) {
  return (
    <LoadMoreList items={featured} mobileSize={2} desktopSize={4} noun="featured events">
      {(visible) => (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {visible.map((event) => <FeaturedCard key={`${event.region}-${event.when}-${event.summary}`} event={event} />)}
        </div>
      )}
    </LoadMoreList>
  );
}
