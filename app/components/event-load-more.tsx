"use client";

import type { CircuitEvent } from "../events";
import { EventCard } from "./event-card";
import { LoadMoreList } from "./load-more";

export function EventLoadMoreCards({
  events,
  as = "h3",
  gridClassName = "grid gap-4",
  noun = "events",
  mobileSize = 6,
  desktopSize = 12,
}: {
  events: CircuitEvent[];
  as?: "h2" | "h3" | "h4";
  gridClassName?: string;
  noun?: string;
  mobileSize?: number;
  desktopSize?: number;
}) {
  return (
    <LoadMoreList
      items={events}
      mobileSize={mobileSize}
      desktopSize={desktopSize}
      noun={noun}
    >
      {(visible) => (
        <div className={gridClassName}>
          {visible.map((event) => (
            <EventCard
              key={`${event.region}-${event.when}-${event.summary}`}
              event={event}
              as={as}
            />
          ))}
        </div>
      )}
    </LoadMoreList>
  );
}
