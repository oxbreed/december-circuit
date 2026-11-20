"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminEventRow, AdminPlaceRow } from "./admin-directory-data";

export function AdminEventList({ rows }: { rows: AdminEventRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => row.haystack.includes(needle));
  }, [rows, query]);

  return (
    <div className="min-w-0">
      <label className="mt-6 block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Search</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search events"
          className="ledger-input"
        />
      </label>
      <p className="mt-3 text-sm leading-6 text-muted">
        {filtered.length === rows.length
          ? `${rows.length} on file.`
          : `Showing ${filtered.length} of ${rows.length}.`}
      </p>
      {filtered.length === 0 ? (
        <p className="mt-3 text-sm leading-7 text-ink">No events match that search.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {filtered.map((row) => (
            <li key={row.slug} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {row.region}
                {row.sourceId ? ` · ${row.sourceId}` : ""}
              </p>
              <p>
                <Link href={row.href} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                  {row.name}
                </Link>
              </p>
              <p className="text-muted">
                {row.when}
                {row.venue ? `. ${row.venue}` : ""}
              </p>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {row.url ? (
                  <a
                    href={row.url}
                    className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                  >
                    Source
                  </a>
                ) : (
                  <span className="text-muted">No source link</span>
                )}
                {row.ticketsUrl ? (
                  <a
                    href={row.ticketsUrl}
                    className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                  >
                    Tickets
                  </a>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminPlaceList({ rows }: { rows: AdminPlaceRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => row.haystack.includes(needle));
  }, [rows, query]);

  return (
    <div className="min-w-0">
      <label className="mt-6 block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Search</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search places"
          className="ledger-input"
        />
      </label>
      <p className="mt-3 text-sm leading-6 text-muted">
        {filtered.length === rows.length
          ? `${rows.length} on file.`
          : `Showing ${filtered.length} of ${rows.length}.`}
      </p>
      {filtered.length === 0 ? (
        <p className="mt-3 text-sm leading-7 text-ink">No places match that search.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {filtered.map((row) => (
            <li key={row.slug} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {row.category} · {row.city}, {row.country}
              </p>
              <p>
                <Link href={row.href} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                  {row.name}
                </Link>
              </p>
              <a
                href={row.url}
                className="mt-1 inline-flex break-all underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                Source
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
