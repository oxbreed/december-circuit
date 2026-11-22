"use client";

import Link from "next/link";
import { lazy, Suspense } from "react";
import { removeTrip, useTripItems } from "./trip-storage";

const TripRowsList = lazy(() => import("./trip-rows").then((module) => ({ default: module.TripRowsList })));

const textLink = "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

export function MyTripList() {
  const items = useTripItems();

  if (items.length === 0) {
    return (
      <div className="mt-4 border border-dashed border-ink/30 bg-paper px-4 py-6 sm:px-5">
        <p className="text-base leading-7 text-ink">
          Nothing saved yet. Save a featured event or a place to start your trip.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-6">
          <Link href="#featured" className={textLink}>
            Featured events
          </Link>
          <Link href="/events" className={textLink}>
            Events
          </Link>
          <Link href="/places" className={textLink}>
            Places
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Suspense fallback={<p role="status">Loading your saved stops…</p>}>
        <TripRowsList items={items} onRemove={removeTrip} />
      </Suspense>
    </div>
  );
}
