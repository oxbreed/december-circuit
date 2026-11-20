"use client";

import Link from "next/link";
import { useTripItems } from "./trip-storage";

/**
 * My Trip stays in the header. Empty lists use a dashed placeholder;
 * a saved item switches it to the counted link.
 */
export function HeaderTripLink({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const items = useTripItems();
  const hideOnDesktop = className?.includes("lg:hidden") ? "lg:hidden " : "";

  if (items.length === 0) {
    return (
      <Link
        href="/#trip"
        aria-label="My Trip, nothing saved yet"
        className={`${hideOnDesktop}inline-flex shrink-0 items-center border border-dashed border-ink/35 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-ink/70 hover:border-ink/70 hover:text-ink`}
      >
        My Trip
      </Link>
    );
  }

  const base =
    className ??
    (compact
      ? "shrink-0 text-[11px] uppercase tracking-[0.14em] text-oxide"
      : "text-[11px] uppercase tracking-[0.14em] text-oxide underline decoration-oxide/50 underline-offset-8 hover:decoration-oxide xl:tracking-[0.16em]");

  return (
    <Link href="/#trip" className={base}>
      My Trip
      <span className="ml-1 tabular-nums text-ink/70">({items.length})</span>
    </Link>
  );
}
