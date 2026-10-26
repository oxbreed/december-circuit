"use client";

import Link from "next/link";
import type { SearchHit } from "../search";
import { kindLabel } from "../search";
import { LoadMoreList } from "./load-more";
import { EmptyList } from "./states";

function kindTone(kind: SearchHit["kind"]) {
  if (kind === "event") return "text-oxide";
  if (kind === "place") return "text-lagoon";
  return "text-brass";
}

export function SearchResults({
  q,
  results,
}: {
  q: string;
  results: SearchHit[];
}) {
  if (!q) {
    return (
      <EmptyList href="/list" cta="List an event or place">
        Type a query to search the directory on file.
      </EmptyList>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyList href="/list" cta="List an event or place">
        No confirmed event, place, or guide page matches “{q}”.
      </EmptyList>
    );
  }

  return (
    <LoadMoreList items={results} mobileSize={8} desktopSize={20} noun="results">
      {(visible) => (
        <>
          <p className="text-sm text-muted">
            {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
          </p>
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {visible.map((hit) => (
              <li key={hit.href}>
                <Link href={hit.href} className="block py-4 hover:text-oxide">
                  <span
                    className={`text-[10px] uppercase tracking-[0.2em] ${kindTone(hit.kind)}`}
                  >
                    {kindLabel(hit.kind)}
                  </span>
                  <span className="mt-1 block font-display text-2xl leading-tight tracking-tight">
                    {hit.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    {hit.subtitle}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </LoadMoreList>
  );
}
