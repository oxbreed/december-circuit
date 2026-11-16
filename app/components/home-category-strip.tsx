"use client";

import Link from "next/link";
import type { VisitorCategoryEntry } from "../visitor-categories";
import { visitorCategoryCountLine } from "../visitor-categories";
import { LoadMoreList } from "./load-more";

const cardLink =
  "flex h-full flex-col border border-ink/15 bg-chart px-4 py-4 hover:border-oxide/40";

export function HomeCategoryStrip({ entries }: { entries: VisitorCategoryEntry[] }) {
  return (
    <LoadMoreList items={entries} mobileSize={2} desktopSize={4} noun="place categories">
      {(visible) => (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((item) => (
            <li key={item.slug}>
              <Link href={`/categories/${item.slug}`} className={cardLink}>
                <p className="font-display text-xl leading-none tracking-tight">{item.category}</p>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                  {visitorCategoryCountLine(item.count, item.exploreKind)}
                </p>
                <span className="mt-3 text-[11px] uppercase tracking-[0.16em] text-oxide">Category →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}