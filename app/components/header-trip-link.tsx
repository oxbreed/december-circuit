"use client";

import Link from "next/link";
import { useTripItems } from "./trip-storage";

export function HeaderTripLink({ dock = false }: { dock?: boolean }) {
  const count = useTripItems().length;

  return (
    <Link
      href="/#trip"
      aria-label={count ? `My Trip, ${count} saved` : "My Trip, nothing saved yet"}
      className={dock
        ? "mobile-dock-action"
        : "inline-flex shrink-0 items-center text-[11px] uppercase tracking-[0.14em] text-oxide underline decoration-oxide/50 underline-offset-8 hover:decoration-oxide"}
    >
      {dock ? "Trip" : "My Trip"}
      {count > 0 && <span aria-hidden="true" className="tabular-nums"> {count}</span>}
    </Link>
  );
}
