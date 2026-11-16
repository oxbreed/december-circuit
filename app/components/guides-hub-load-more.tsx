"use client";

import Link from "next/link";
import type { SeasonGuideMeta, VisaNationality } from "../season-guides";
import { LoadMoreList } from "./load-more";

const guideCard =
  "block border border-ink/15 bg-chart px-5 py-6 hover:border-oxide/40";

export function GuidesSeasonLoadMore({ guides }: { guides: SeasonGuideMeta[] }) {
  return (
    <LoadMoreList items={guides} mobileSize={6} desktopSize={12} noun="season guides">
      {(visible) => (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.map((guide) => (
            <li key={guide.path}>
              <Link href={guide.path} className={guideCard}>
                <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                  {guide.path}
                </p>
                <p className="mt-2 font-display text-2xl leading-tight tracking-tight">
                  {guide.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">{guide.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}

export function VisaNationalityLoadMore({
  pages,
  travellersSuffix = true,
}: {
  pages: VisaNationality[];
  travellersSuffix?: boolean;
}) {
  return (
    <LoadMoreList items={pages} mobileSize={6} desktopSize={12} noun="passport pages">
      {(visible) => (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {visible.map((page) => (
            <li key={page.slug}>
              <Link
                href={page.path}
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {page.travellerLabel}
                {travellersSuffix ? " travellers" : ""}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}