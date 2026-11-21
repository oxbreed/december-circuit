import Link from "next/link";
import { listApprovals } from "../admin-approvals";
import { listDirectoryEntries } from "../directory-entries";
import { eventRowsForAdmin, placeRowsForAdmin } from "./admin-directory-data";
import { AdminSearchForm } from "./admin-search-form";
import { hrefForSection } from "../admin-routes";

export async function AdminSearchSection({ q }: { q?: string | string[] }) {
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const needle = query.toLowerCase();
  const events = needle
    ? eventRowsForAdmin().filter((row) => row.haystack.includes(needle)).slice(0, 8)
    : [];
  const places = needle
    ? placeRowsForAdmin().filter((row) => row.haystack.includes(needle)).slice(0, 8)
    : [];
  const submissions = needle
    ? await listApprovals({ tab: "pending", q: query })
    : { reason: "ok" as const, rows: [] };
  const entries = needle ? await listDirectoryEntries() : { reason: "ok" as const, rows: [] };
  const entryHits =
    needle && entries.reason === "ok"
      ? entries.rows
          .filter((row) =>
            [row.title, row.slug, row.kind, row.status].join(" ").toLowerCase().includes(needle),
          )
          .slice(0, 8)
      : [];

  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Search</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Look through events, places, pending submissions, and records saved in the panel.
      </p>
      <div className="mt-4">
        <AdminSearchForm defaultValue={query} />
      </div>
      {!query ? (
        <div className="mt-6">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">Quick actions</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            <li>
              <Link href={hrefForSection("approvals")} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                Open the approvals inbox
              </Link>
            </li>
            <li>
              <Link href={hrefForSection("events")} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                Manage events
              </Link>
            </li>
            <li>
              <Link href={hrefForSection("places")} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                Manage places
              </Link>
            </li>
            <li>
              <Link href={hrefForSection("affiliates")} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                Review partner clicks
              </Link>
            </li>
            <li>
              <Link href={hrefForSection("dashboard")} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                Open Insights
              </Link>
            </li>
          </ul>
        </div>
      ) : (
        <div className="mt-8 grid gap-8">
          <ResultGroup title="Events" empty="No events match that search.">
            {events.map((row) => (
              <li key={row.slug}>
                <Link href={row.href} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                  {row.name}
                </Link>
                <span className="text-muted"> · {row.region}</span>
              </li>
            ))}
          </ResultGroup>
          <ResultGroup title="Places" empty="No places match that search.">
            {places.map((row) => (
              <li key={row.slug}>
                <Link href={row.href} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                  {row.name}
                </Link>
                <span className="text-muted"> · {row.city}</span>
              </li>
            ))}
          </ResultGroup>
          <ResultGroup title="Pending submissions" empty="No pending submissions match that search.">
            {submissions.rows.map((row) => (
              <li key={row.id}>
                <Link
                  href={hrefForSection("approvals", { q: query })}
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  {row.event_name || row.business_name || row.product_name || row.kind}
                </Link>
                <span className="text-muted"> · {row.kind}</span>
              </li>
            ))}
          </ResultGroup>
          <ResultGroup title="Panel records" empty="No saved overlays match that search.">
            {entryHits.map((row) => (
              <li key={row.id}>
                <Link
                  href={hrefForSection(sectionForEntryKind(row.kind))}
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  {row.title}
                </Link>
                <span className="text-muted">
                  {" "}
                  · {row.kind} · {row.status}
                </span>
              </li>
            ))}
          </ResultGroup>
        </div>
      )}
    </section>
  );
}


function sectionForEntryKind(kind: string) {
  if (kind === "event") return "events" as const;
  if (kind === "place") return "places" as const;
  if (kind === "landmark") return "landmarks" as const;
  if (kind === "featured") return "featured" as const;
  return "affiliates" as const;
}

function ResultGroup({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const has = items.filter(Boolean).length > 0;
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">{title}</h3>
      {has ? <ul className="mt-3 grid gap-2 text-sm leading-6">{children}</ul> : <p className="mt-3 text-sm leading-7 text-muted">{empty}</p>}
    </div>
  );
}
