"use client";

import Link from "next/link";
import { useTripItems } from "./trip-storage";

/**
 * My Trip in the header only after something is saved in this browser.
 * Empty trip → hidden (not a permanent nav item).
 */
export function HeaderTripLink({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const items = useTripItems();
  if (items.length === 0) return null;

  const base =
    className ??
    (compact
      ? "shrink-0 text-[11px] uppercase tracking-[0.14em] text-oxide"
      : "text-[11px] uppercase tracking-[0.14em] text-oxide underline decoration-oxide/50 underline-offset-8 hover:decoration-oxide xl:tracking-[0.16em]");

  return (
    <Link href="/#trip" className={base}>
      My Trip
      <span className="ml-1 tabular-nums text-ink/55">({items.length})</span>
    </Link>
  );
}
