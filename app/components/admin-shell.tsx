import type { ReactNode } from "react";
import Link from "next/link";
import { signOut } from "../auth/actions";
import type { AdminSection } from "../admin-routes";
import { AdminNav } from "./admin-nav";
import { AdminSearchForm } from "./admin-search-form";

export type { AdminSection };

const known: AdminSection[] = [
  "overview",
  "approvals",
  "events",
  "places",
  "featured",
  "landmarks",
  "affiliates",
  "dashboard",
  "audit",
  "reviews",
  "probes",
  "settings",
  "search",
];

export function parseAdminSection(
  value: string | string[] | undefined,
): AdminSection {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && (known as string[]).includes(raw)) return raw as AdminSection;
  if (raw === "analytics" || raw === "insights") return "dashboard";
  if (raw === "wp-probes" || raw === "wp_probes") return "probes";
  if (raw === "outbound" || raw === "outbound-clicks" || raw === "clicks") return "affiliates";
  if (raw === "featured-submissions" || raw === "placement" || raw === "placements" || raw === "get-featured") {
    return "affiliates";
  }
  if (raw === "submissions" || raw === "inbox") return "approvals";
  if (raw === "directory" || raw === "home") return "overview";
  if (raw === "posters" || raw === "shows") return "landmarks";
  if (raw === "log" || raw === "activity") return "audit";
  return "overview";
}

export function AdminShell({
  email,
  section,
  pendingCount = 0,
  preview = false,
  children,
}: {
  email: string;
  section: AdminSection;
  pendingCount?: number;
  preview?: boolean;
  children: ReactNode;
}) {
  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Ox Management</p>
          <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
            Control panel
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            Review submissions, publish directory records, and watch partner clicks for
            dirtydecember.info. Signed in as {email}.
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <AdminSearchForm />
          <Link
            href="/sign-in"
            className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            Account
          </Link>
          {preview ? (
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Preview</p>
          ) : (
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex max-w-full bg-ink px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-chart"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
        <aside className="min-w-0 lg:sticky lg:top-28">
          <AdminNav section={section} pendingCount={pendingCount} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
