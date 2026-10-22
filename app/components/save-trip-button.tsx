"use client";

import { toggleTrip, useTripItems, type TripItem } from "./trip-storage";

export function SaveTripButton({ kind, id }: TripItem) {
  const saved = useTripItems().some((item) => item.kind === kind && item.id === id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => toggleTrip({ kind, id })}
      className="inline-flex border border-ink/25 bg-paper px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-ink hover:border-oxide hover:text-oxide"
    >
      {saved ? "Remove from My trip" : "Save to My trip"}
    </button>
  );
}
