import Link from "next/link";
import { dashboardRanges, rangeLabel, type DashboardRange } from "../admin-dashboard";

export function AdminDashboardRange({ range }: { range: DashboardRange }) {
  return (
    <div role="navigation" aria-label="Date range" className="flex flex-wrap gap-2">
      {dashboardRanges.map((key) => {
        const active = key === range;
        return (
          <Link
            key={key}
            href={`/admin?section=dashboard&range=${key}`}
            className={`inline-flex px-3 py-2 text-[11px] uppercase tracking-[0.16em] ${
              active
                ? "bg-ink text-chart"
                : "border border-ink/20 bg-chart text-ink hover:border-oxide hover:text-oxide"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {rangeLabel(key)}
          </Link>
        );
      })}
    </div>
  );
}
