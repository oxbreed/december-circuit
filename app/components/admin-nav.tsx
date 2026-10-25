"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminSection } from "./admin-shell";

const items: { id: AdminSection; label: string }[] = [
  { id: "dashboard", label: "Dashboard / Insights" },
  { id: "submissions", label: "Submissions" },
  { id: "reviews", label: "Reviews" },
  { id: "probes", label: "Probes" },
  { id: "settings", label: "Settings" },
];

function hrefFor(section: AdminSection) {
  return section === "dashboard" ? "/admin" : `/admin?section=${section}`;
}

export function AdminNav({ section }: { section: AdminSection }) {
  const router = useRouter();

  return (
    <nav aria-label="Ox Management" className="min-w-0">
      <div className="lg:hidden">
        <label className="block min-w-0">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
            Section
          </span>
          <select
            className="ledger-input py-2!"
            value={section}
            onChange={(event) => {
              router.push(hrefFor(event.target.value as AdminSection));
            }}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="hidden lg:grid gap-1">
        {items.map((item) => {
          const active = item.id === section;
          return (
            <li key={item.id}>
              <Link
                href={hrefFor(item.id)}
                className={`block border-l-2 px-3 py-2 text-sm leading-6 transition-colors ${
                  active
                    ? "border-oxide bg-chart text-ink"
                    : "border-transparent text-muted hover:border-ink/20 hover:bg-chart/70 hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
