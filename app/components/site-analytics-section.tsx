import type { ReactNode } from "react";
import { AnalyticsOverview, AnalyticsOverviewEmpty } from "./analytics-overview";
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

function StatusLine({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-sm text-muted">{children}</p>;
}

function PerformanceTiles({
  metrics,
  empty,
}: {
  metrics: VitalMetricSummary[] | null;
  empty: boolean;
}) {
  const cards =
    metrics ??
    ([
      { metric: "LCP", p75: null, unit: "ms", thresholds: { good: 2500, poor: 4000 } },
      { metric: "INP", p75: null, unit: "ms", thresholds: { good: 200, poor: 500 } },
      { metric: "CLS", p75: null, unit: "score", thresholds: { good: 0.1, poor: 0.25 } },
    ] as VitalMetricSummary[]);

  return (
    <div className="mt-8">
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

export async function SiteAnalyticsSection() {
  const [visits, vitals] = await Promise.all([summarizePageViews(), summarizeWebVitals()]);
  const visitsReady = visits.reason === "ok" && visits.summary && visits.summary.total > 0;
  const vitalsReady =
    vitals.reason === "ok" && vitals.summary && vitals.summary.sampleSize > 0;

  return (
    <section className="mt-8" data-admin-analytics="overview-report">
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
        <AnalyticsOverviewEmpty message="Admin only." />
      ) : visits.reason === "no-key" ? (
        <AnalyticsOverviewEmpty message="Server key not set. Apply Supabase service role to load live visits." />
      ) : visits.reason === "error" ? (
        <AnalyticsOverviewEmpty message="Could not read visits. Apply page_views migration." />
      ) : !visitsReady ? (
        <AnalyticsOverviewEmpty message="No visits yet. Apply page_views migration, then wait for traffic." />
      ) : (
        <AnalyticsOverview summary={visits.summary!} />
      )}

      {vitals.reason === "forbidden" || vitals.reason === "no-key" ? null : vitals.reason ===
        "error" ? (
        <StatusLine>Could not read Web Vitals. Apply web_vitals migration.</StatusLine>
      ) : (
        <PerformanceTiles
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
