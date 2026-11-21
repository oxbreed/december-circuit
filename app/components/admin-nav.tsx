import type { ReactNode } from "react";
import Link from "next/link";
import { hrefForSection, type AdminSection } from "../admin-routes";

type NavItem = { id: AdminSection; label: string; badge?: number };
type NavGroup = { label: string; items: NavItem[] };

export const adminNavGroups: NavGroup[] = [
  {
    label: "Work",
    items: [
      { id: "overview", label: "Overview" },
      { id: "approvals", label: "Approvals" },
    ],
  },
  {
    label: "Directory",
    items: [
      { id: "events", label: "Events" },
      { id: "places", label: "Places" },
      { id: "featured", label: "Featured" },
      { id: "landmarks", label: "Landmarks" },
    ],
  },
  {
    label: "Partners",
    items: [{ id: "affiliates", label: "Affiliates" }],
  },
  {
    label: "Insights",
    items: [
      { id: "dashboard", label: "Insights" },
      { id: "audit", label: "Audit log" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "reviews", label: "Reviews" },
      { id: "probes", label: "Probes" },
      { id: "settings", label: "Settings" },
    ],
  },
];

export function AdminNav({
  section,
  pendingCount = 0,
  pendingBadge,
}: {
  section: AdminSection;
  pendingCount?: number;
  pendingBadge?: ReactNode;
}) {
  const groups = adminNavGroups.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.id === "approvals" && pendingCount > 0 && !pendingBadge ? { ...item, badge: pendingCount } : item,
    ),
  }));
  const flat = groups.flatMap((group) => group.items);

  return (
    <nav aria-label="Control panel" className="min-w-0">
      <div className="lg:hidden">
        <form action="/admin" method="get" className="block min-w-0">
          <label className="block min-w-0">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
              Section
            </span>
            <span className="flex min-w-0 items-end gap-2">
              <select
                className="ledger-input py-2!"
                name="section"
                defaultValue={section === "search" ? "overview" : section}
              >
                {groups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.badge ? `${item.label} (${item.badge})` : item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex shrink-0 border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-ink hover:border-oxide hover:text-oxide"
              >
                Open
              </button>
            </span>
          </label>
        </form>
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {flat.map((item) => {
            const active = item.id === section;
            return (
              <li key={item.id} className="shrink-0">
                <Link
                  href={hrefForSection(item.id)}
                  className={`inline-flex items-center gap-2 border px-3 py-2 text-[11px] uppercase tracking-[0.14em] ${
                    active
                      ? "border-ink bg-ink text-chart"
                      : "border-ink/20 bg-chart text-ink hover:border-oxide hover:text-oxide"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  {item.id === "approvals"
                    ? pendingBadge
                    : item.badge
                      ? <span className={active ? "text-chart" : "text-oxide"}>{item.badge}</span>
                      : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="hidden lg:grid gap-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[10px] uppercase tracking-[0.16em] text-muted">{group.label}</p>
            <ul className="mt-1 grid gap-1">
              {group.items.map((item) => {
                const active = item.id === section;
                return (
                  <li key={item.id}>
                    <Link
                      href={hrefForSection(item.id)}
                      className={`flex items-center justify-between gap-2 border-l-2 px-3 py-2 text-sm leading-6 transition-colors ${
                        active
                          ? "border-oxide bg-chart text-ink"
                          : "border-transparent text-muted hover:border-ink/20 hover:bg-chart/70 hover:text-ink"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                      {item.id === "approvals" ? (
                        pendingBadge
                      ) : item.badge ? (
                        <span className="bg-oxide px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-chart">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
