import type { ReactNode } from "react";
import { AdminNav } from "./admin-nav";

export type AdminSection =
  | "dashboard"
  | "submissions"
  | "reviews"
  | "probes"
  | "settings";

export function parseAdminSection(
  value: string | string[] | undefined,
): AdminSection {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw === "submissions" ||
    raw === "reviews" ||
    raw === "probes" ||
    raw === "settings" ||
    raw === "dashboard"
  ) {
    return raw;
  }
  // Back-compat aliases from older admin copy
  if (raw === "analytics" || raw === "insights") return "dashboard";
  if (raw === "wp-probes" || raw === "wp_probes") return "probes";
  return "dashboard";
}

export function AdminShell({
  email,
  section,
  children,
}: {
  email: string;
  section: AdminSection;
  children: ReactNode;
}) {
  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Ox Management</p>
          <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
            DirtyDecember
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            Control panel for the directory on file. Signed in as {email}. Not WordPress — no posts,
            plugins, or media library here.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
        <aside className="min-w-0 lg:sticky lg:top-28">
          <AdminNav section={section} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
