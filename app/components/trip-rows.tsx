"use client";

import { presentEvent } from "../event-view";
import { events, type CircuitEvent } from "../events";
import { places } from "../places";
import { eventTripId, placeTripId } from "../trip";
import { LoadMoreList } from "./load-more";
import type { TripItem } from "./trip-storage";

type TripLink = {
  href: string;
  label: string;
};

export type TripRow = {
  item: TripItem;
  kind: string;
  name: string;
  href?: string;
  meta: string;
  links: TripLink[];
};

function eventLinks(event: CircuitEvent): TripLink[] {
  const links: TripLink[] = [];
  if (event.ticketsUrl) links.push({ href: event.ticketsUrl, label: "Tickets" });
  if (event.url) links.push({ href: event.url, label: event.urlLabel ?? "Organiser page" });
  return links;
}

export function resolveTripItem(item: TripItem): TripRow {
  if (item.kind === "event") {
    const event = events.find((row) => eventTripId(row) === item.id);
    if (!event) {
      return {
        item,
        kind: "Event",
        name: "This saved item is no longer listed.",
        meta: "",
        links: [],
      };
    }
    const view = presentEvent(event);
    return {
      item,
      kind: "Event",
      name: view.name,
      href: view.href,
      meta: `${view.region} · ${event.when}`,
      links: eventLinks(event),
    };
  }

  const place = places.find((row) => placeTripId(row) === item.id);
  if (!place) {
    return {
      item,
      kind: "Place",
      name: "This saved item is no longer listed.",
      meta: "",
      links: [],
    };
  }
  return {
    item,
    kind: place.category,
    name: place.name,
    meta: `${place.city}, ${place.country}`,
    links: place.url ? [{ href: place.url, label: "Organiser page" }] : [],
  };
}

function StoredLinks({ links }: { links: TripLink[] }) {
  if (links.length === 0) {
    return <p className="mt-3 text-sm leading-6 text-muted">The link is not listed.</p>;
  }

  return (
    <ul className="mt-3 flex flex-col items-start gap-2">
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            {link.label} — leaves this site
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TripRowsList({
  items,
  readOnly,
  onRemove,
  removePending = false,
}: {
  items: TripItem[];
  readOnly?: boolean;
  removePending?: boolean;
  onRemove?: (item: TripItem) => void;
}) {
  const rows = items.map(resolveTripItem);

  if (rows.length === 0) return null;

  return (
    <LoadMoreList items={rows} mobileSize={6} desktopSize={12} noun="saved">
      {(visible) => (
        <ul className="grid gap-4">
          {visible.map((row) => (
            <li
              key={`${row.item.kind}-${row.item.id}`}
              className="flex flex-col gap-4 border border-ink/15 bg-paper p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">{row.kind}</p>
                {row.href ? (
                  <h3 className="mt-2 font-display text-3xl leading-none tracking-tight sm:text-4xl">
                    <a href={row.href} className="hover:text-oxide">
                      {row.name}
                    </a>
                  </h3>
                ) : (
                  <h3 className="mt-2 font-display text-3xl leading-none tracking-tight sm:text-4xl">
                    {row.name}
                  </h3>
                )}
                {row.meta ? <p className="mt-2 text-sm text-ink">{row.meta}</p> : null}
                <StoredLinks links={row.links} />
              </div>
              {readOnly || !onRemove ? null : (
                <button
                  type="button"
                  disabled={removePending}
                  onClick={() => onRemove(row.item)}
                  className="inline-flex shrink-0 self-start border border-ink/25 bg-chart px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-ink hover:border-oxide hover:text-oxide disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}