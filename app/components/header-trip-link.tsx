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
        : "inline-flex shrink-0 items-center border border-ink/20 bg-chart px-3 text-[12px] tracking-wide text-ink hover:text-oxide"}
    >
      {dock ? "Trip" : "My Trip"}
      {count > 0 && <span aria-hidden="true" className="tabular-nums"> {count}</span>}
    </Link>
  );
}
