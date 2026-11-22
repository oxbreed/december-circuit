"use client";

import Link from "next/link";
import type { VisitorCategoryEntry } from "../visitor-categories";
import { visitorCategoryCountLine } from "../visitor-categories";
import { LoadMoreList } from "./load-more";

const cardLink = "flex h-full flex-col border border-ink/15 bg-chart px-4 py-5 hover:border-oxide/40";

export function VisitorCategoryHubGrid({ entries }: { entries: VisitorCategoryEntry[] }) {
  return (
    <LoadMoreList items={entries} mobileSize={3} desktopSize={6} noun="category hubs">
      {(visible) => (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.slug}>
              <Link href={`/categories/${item.slug}`} className={cardLink}>
                <p className="font-display text-2xl leading-none tracking-tight">{item.category}</p>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted">{visitorCategoryCountLine(item.count, item.category, item.exploreKind)}</p>
                <span className="mt-4 text-[11px] uppercase tracking-[0.16em] text-oxide">Category hub →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}
