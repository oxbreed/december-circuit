import type { ReactNode } from "react";
import type { CountRow, DayCount, PageViewSummary } from "../page-views";
import { summarizePageViews } from "../page-views";
import type { VitalMetricSummary } from "../web-vitals-summary";
import { summarizeWebVitals } from "../web-vitals-summary";

function formatVital(value: number | null, unit: "ms" | "score") {
  if (value === null) return "—";
  if (unit === "score") return value.toFixed(2);
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

function vitalTone(metric: VitalMetricSummary) {
  if (metric.p75 === null) return "text-muted";
  if (metric.p75 <= metric.thresholds.good) return "text-lagoon";
  if (metric.p75 <= metric.thresholds.poor) return "text-brass";
  return "text-oxide";
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/15 bg-chart px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl leading-none tracking-tight text-ink tabular-nums">
        {value}
      </p>
    </div>
  );
}

function RankedList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: CountRow[];
  empty: string;
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink/10">
          {rows.map((row) => (
            <li key={row.label} className="relative py-2.5">
              <div
                className="absolute inset-y-0 left-0 bg-lagoon/10"
                style={{ width: `${Math.round((row.count / max) * 100)}%` }}
              />
              <div className="relative flex items-baseline justify-between gap-3 text-sm text-ink">
                <span className="min-w-0 truncate" title={row.label}>
                  {row.label}
                </span>
                <span className="shrink-0 tabular-nums text-muted">{row.count}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DayChart({ days }: { days: DayCount[] }) {
  if (days.length === 0 || days.every((d) => d.count === 0)) {
    return <p className="mt-3 text-sm text-muted">No data yet</p>;
  }
  const max = Math.max(...days.map((d) => d.count), 1);
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">Views · 30 days</h3>
      <div className="mt-3 flex h-24 items-end gap-px sm:gap-0.5">
        {days.map((d) => (
          <div
            key={d.day}
            className="min-w-0 flex-1 bg-ink/80"
            style={{ height: `${Math.max(3, Math.round((d.count / max) * 100))}%` }}
            title={`${d.day}: ${d.count}`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted">
        <span>{days[0]?.day.slice(5)}</span>
        <span>{days[days.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}

function VisitsBlock({ summary }: { summary: PageViewSummary }) {
  return (
    <div className="mt-5 grid gap-6">
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <Tile label="24 hours" value={String(summary.last24h)} />
        <Tile label="7 days" value={String(summary.last7d)} />
        <Tile label="30 days" value={String(summary.last30d)} />
        <Tile label="Pages" value={String(summary.uniquePaths)} />
        <Tile label="Countries" value={String(summary.uniqueCountries)} />
      </div>

      <DayChart days={summary.daily30} />

      <div className="grid gap-8 lg:grid-cols-3">
        <RankedList title="Top pages" rows={summary.topPaths} empty="No pages yet" />
        <RankedList title="Top countries" rows={summary.topCountries} empty="No countries yet" />
        <RankedList title="Top sources" rows={summary.topReferrers} empty="No sources yet" />
      </div>
    </div>
  );
}

function PerformanceBlock({
  metrics,
  empty,
}: {
  metrics: VitalMetricSummary[] | null;
  empty: boolean;
}) {
  const cards =
    metrics ??
    ([
      { metric: "LCP", p75: null, unit: "ms" },
      { metric: "INP", p75: null, unit: "ms" },
      { metric: "CLS", p75: null, unit: "score" },
    ] as VitalMetricSummary[]);

  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">
          Web Vitals · 7 days · p75
        </h3>
        {empty ? <span className="text-sm text-muted">No samples yet</span> : null}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {cards.map((metric) => (
          <div key={metric.metric} className="border border-ink/15 bg-chart px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{metric.metric}</p>
            <p
              className={`mt-2 font-display text-4xl leading-none tracking-tight tabular-nums ${vitalTone(metric)}`}
            >
              {formatVital(metric.p75, metric.unit)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusLine({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-sm text-muted">{children}</p>;
}

export async function SiteAnalyticsSection() {
  const [visits, vitals] = await Promise.all([summarizePageViews(), summarizeWebVitals()]);

  const visitsReady =
    visits.reason === "ok" && visits.summary && visits.summary.total > 0;
  const vitalsReady =
    vitals.reason === "ok" && vitals.summary && vitals.summary.sampleSize > 0;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-3xl leading-none tracking-tight">Analytics</h2>
        <a
          href="https://vercel.com/dashboard"
          className="text-sm text-muted underline decoration-ink/25 underline-offset-4 hover:text-oxide"
          target="_blank"
          rel="noreferrer"
        >
          Open in Vercel
        </a>
      </div>

      {visits.reason === "forbidden" ? (
        <StatusLine>Admin only.</StatusLine>
      ) : visits.reason === "no-key" ? (
        <StatusLine>Server key not set.</StatusLine>
      ) : visits.reason === "error" ? (
        <StatusLine>Could not read visits. Apply page_views migration.</StatusLine>
      ) : !visitsReady ? (
        <StatusLine>No visits yet. Apply page_views migration, then wait for traffic.</StatusLine>
      ) : (
        <VisitsBlock summary={visits.summary!} />
      )}

      {vitals.reason === "forbidden" || vitals.reason === "no-key" ? null : vitals.reason ===
        "error" ? (
        <StatusLine>Could not read Web Vitals. Apply web_vitals migration.</StatusLine>
      ) : (
        <PerformanceBlock
          metrics={vitalsReady ? vitals.summary!.last7d : null}
          empty={!vitalsReady}
        />
      )}
    </section>
  );
}

export function SiteAnalyticsSectionFallback() {
  return (
    <section className="mt-8">
      <h2 className="font-display text-3xl leading-none tracking-tight">Analytics</h2>
      <p className="mt-3 text-sm text-muted">Loading…</p>
    </section>
  );
}
