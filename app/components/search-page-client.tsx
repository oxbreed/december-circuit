"use client";

import { useEffect, useState } from "react";
import { SearchResults } from "./search-results";
import type { SearchHit } from "../search";

export function SearchPageClient() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
    setQ(query);
    if (!query) {
      setResults([]);
      setReady(true);
      return;
    }
    let cancel = false;
    fetch(`/api/search?q=${encodeURIComponent(query)}&limit=40`)
      .then((response) => response.json())
      .then((data: { results?: SearchHit[] }) => {
        if (!cancel) {
          setResults(data.results ?? []);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancel) {
          setResults([]);
          setReady(true);
        }
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <>
      <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-lagoon">Directory search</p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">{q ? `Search: ${q}` : "Search"}</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">Matches confirmed events, organiser places, and guide pages already on file — never invented listings.</p>
      <form role="search" action="/search" method="get" className="mt-8 max-w-xl">
        <label htmlFor="search-page-q" className="sr-only">Search query</label>
        <div className="flex gap-2">
          <input id="search-page-q" name="q" type="search" defaultValue={q} placeholder="Event, place, city, or guide" className="ledger-input flex-1" />
          <button type="submit" className="shrink-0 bg-oxide px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-chart">Search</button>
        </div>
      </form>
      <section className="mt-10" aria-live="polite">
        {ready ? <SearchResults q={q} results={results} /> : <p className="text-sm text-muted">Loading search…</p>}
      </section>
    </>
  );
}
