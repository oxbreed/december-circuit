"use client";

import Link from "next/link";
import type { CircuitEvent } from "../events";
import { presentEvent } from "../event-view";
import { LoadMoreList } from "./load-more";

export function ScheduleNightsLoadMore({ nights }: { nights: CircuitEvent[] }) {
  return (
    <LoadMoreList items={nights} mobileSize={6} desktopSize={12} noun="nights">
      {(visible) => (
        <ol className="space-y-0">
          {visible.map((event) => {
            const view = presentEvent(event);
            return (
              <li key={`${event.when}-${event.summary}`} className="border-t border-ink/10 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-lagoon">{event.when}</p>
                <p className="mt-1 font-display text-2xl leading-tight tracking-tight">{view.name}</p>
                {event.url ? (
                  <p className="mt-2">
                    <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                      {event.urlLabel ?? "Official page"} — leaves this site
                    </a>
                  </p>
                ) : null}
                <p className="mt-2">
                  <Link href={view.href} className="text-sm underline decoration-ink/30 underline-offset-4 hover:text-oxide">Directory event page</Link>
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </LoadMoreList>
  );
}
