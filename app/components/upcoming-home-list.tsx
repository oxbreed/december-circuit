"use client";

import Link from "next/link";
import type { CircuitEvent } from "../events";
import { presentEvent } from "../event-view";
import { LoadMoreList } from "./load-more";

export function UpcomingHomeList({ rows }: { rows: CircuitEvent[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-6 max-w-2xl text-sm leading-7 text-muted">
        Nothing on the sourced list falls on or after today in Africa/Lagos.{" "}
        <a href="/list" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">List an event</a> for review.
      </p>
    );
  }
  return (
    <LoadMoreList items={rows} mobileSize={8} desktopSize={12} noun="upcoming events">
      {(visible) => (
        <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          {visible.map((event) => {
            const view = presentEvent(event);
            return (
              <li key={`${event.region}-${event.when}-${event.summary}`} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <div className="min-w-0">
                  <Link href={view.href} className="font-display text-2xl leading-tight tracking-tight hover:text-oxide">{view.name}</Link>
                  <p className="mt-1.5 text-sm text-ink">{view.region}</p>
                </div>
                <p className="shrink-0 text-sm text-muted sm:text-right">{event.when}</p>
              </li>
            );
          })}
        </ul>
      )}
    </LoadMoreList>
  );
}
