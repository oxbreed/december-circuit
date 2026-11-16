"use client";

import Link from "next/link";
import { EmptyList } from "./states";
import { TripRowsList } from "./trip-rows";
import { removeTrip, useTripItems } from "./trip-storage";

export function MyTripList() {
  const items = useTripItems();

  if (items.length === 0) {
    return (
      <div className="mt-6">
        <EmptyList href="/events" cta="Browse confirmed events">
          Nothing is saved yet. Save an event or a place from this directory — My Trip appears in the header
          once you have at least one item.
        </EmptyList>
        <p className="mt-3 text-sm leading-6 text-muted">
          Or{" "}
          <Link
            href="/list"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            list an event or place
          </Link>{" "}
          for review.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <TripRowsList items={items} onRemove={removeTrip} />
    </div>
  );
}