"use client";

import { toggleTrip, useTripItems, type TripItem } from "./trip-storage";

function Mark({ saved }: { saved: boolean }) {
  if (saved) {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
        <path
          d="M3.2 8.3 6.4 11.4 12.8 4.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="square"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M3.5 2.5h9v11L8 10.4 3.5 13.5v-11Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function SaveTripButton({ kind, id }: TripItem) {
  const saved = useTripItems().some((item) => item.kind === kind && item.id === id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Saved. Remove from My Trip" : "Save to My Trip"}
      onClick={() => toggleTrip({ kind, id })}
      className={
        saved
          ? "inline-flex shrink-0 items-center gap-2 border border-lagoon bg-lagoon px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart"
          : "inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart hover:border-oxide hover:bg-oxide"
      }
    >
      <Mark saved={saved} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
