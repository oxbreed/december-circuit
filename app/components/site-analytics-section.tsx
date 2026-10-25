import type { CountRow, DayCount, PageViewSummary } from "../page-views";
import { summarizePageViews } from "../page-views";
import type { VitalMetricSummary, WebVitalsSummary } from "../web-vitals-summary";
import { summarizeWebVitals } from "../web-vitals-summary";

function formatVital(value: number | null, unit: "ms" | "score") {
  if (value === null) return "—";
  if (unit === "score") return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(2)} s`;
  return `${Math.round(value)} ms`;
}

function ratingTone(metric: VitalMetricSummary) {
  if (metric.p75 === null) return "text-muted";
  if (metric.p75 <= metric.thresholds.good) return "text-lagoon";
  if (metric.p75 <= metric.thresholds.poor) return "text-brass";
  return "text-oxide";
}

function BarChart({
  rows,
  emptyLabel,
}: {
  rows: CountRow[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="mt-2 text-sm leading-7 text-muted">{emptyLabel}</p>;
  }
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <ul className="mt-3 grid gap-2">
      {rows.map((row) => (
        <li key={row.label} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-sm leading-6 text-ink">
            <span className="min-w-0 truncate" title={row.label}>
              {row.label}
            </span>
            <span className="shrink-0 tabular-nums text-muted">{row.count}</span>
          </div>
          <div className="mt-1 h-1.5 w-full bg-ink/10">
            <div
              className="h-1.5 bg-lagoon/70"
              style={{ width: `${Math.max(4, Math.round((row.count / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function SparkBars({ days, label }: { days: DayCount[]; label: string }) {
  if (days.length === 0 || days.every((d) => d.count === 0)) {
    return <p className="mt-2 text-sm leading-7 text-muted">No daily traffic in this window yet.</p>;
  }
  const max = Math.max(...days.map((d) => d.count), 1);
  return (
    <div className="mt-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className="mt-2 flex h-16 items-end gap-0.5 sm:gap-1">
        {days.map((d) => (
          <div
            key={d.day}
            className="min-w-0 flex-1 bg-ink/15"
            style={{ height: `${Math.max(6, Math.round((d.count / max) * 100))}%` }}
            title={`${d.day}: ${d.count}`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted">
        <span>{days[0]?.day.slice(5)}</span>
        <span>{days[days.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-ink/15 bg-chart px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl leading-none tracking-tight text-ink tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs leading-5 text-muted">{hint}</p> : null}
    </div>
  );
}

function VisitsDashboard({ summary }: { summary: PageViewSummary }) {
  return (
    <div className="mt-4 grid gap-6">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Last 24h" value={String(summary.last24h)} />
        <StatTile label="Last 7 days" value={String(summary.last7d)} />
        <StatTile label="Last 30 days" value={String(summary.last30d)} />
        <StatTile
          label="Stored sample"
          value={String(summary.total)}
          hint={`Up to ${summary.sampleSize.toLocaleString()} newest rows · ${summary.uniquePaths} paths · ${summary.uniqueCountries} countries`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-2xl leading-none tracking-tight">Traffic by day</h3>
          <SparkBars days={summary.daily7} label="Last 7 days" />
          <div className="mt-4">
            <SparkBars days={summary.daily30} label="Last 30 days" />
          </div>
        </div>
        <div>
          <h3 className="font-display text-2xl leading-none tracking-tight">Top pages</h3>
          <BarChart rows={summary.topPaths} emptyLabel="No page paths in the sample yet." />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-2xl leading-none tracking-tight">Top countries</h3>
          <BarChart
            rows={summary.topCountries}
            emptyLabel="No country codes yet. Production on Vercel fills x-vercel-ip-country."
          />
        </div>
        <div>
          <h3 className="font-display text-2xl leading-none tracking-tight">Top referrers</h3>
          <BarChart
            rows={summary.topReferrers}
            emptyLabel="No external referrers in the sample yet."
          />
        </div>
      </div>
    </div>
  );
}

function VitalCard({ metric, windowLabel }: { metric: VitalMetricSummary; windowLabel: string }) {
  const totalRatings = metric.good + metric.needsImprovement + metric.poor;
  return (
    <div className="border border-ink/15 bg-chart px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
          {metric.metric} · {windowLabel}
        </p>
        <p className={`text-sm tabular-nums ${ratingTone(metric)}`}>
          p75 {formatVital(metric.p75, metric.unit)}
        </p>
      </div>
      <p className="mt-2 font-display text-3xl leading-none tracking-tight tabular-nums text-ink">
        {formatVital(metric.median, metric.unit)}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted">
        Median · {metric.samples} sample{metric.samples === 1 ? "" : "s"}
        {metric.unit === "ms"
          ? ` · good ≤ ${metric.thresholds.good} ms`
          : ` · good ≤ ${metric.thresholds.good}`}
      </p>
      {totalRatings > 0 ? (
        <div className="mt-3 flex h-1.5 w-full overflow-hidden bg-ink/10">
          <div
            className="h-full bg-lagoon"
            style={{ width: `${(metric.good / totalRatings) * 100}%` }}
            title={`Good ${metric.good}`}
          />
          <div
            className="h-full bg-brass"
            style={{ width: `${(metric.needsImprovement / totalRatings) * 100}%` }}
            title={`Needs improvement ${metric.needsImprovement}`}
          />
          <div
            className="h-full bg-oxide"
            style={{ width: `${(metric.poor / totalRatings) * 100}%` }}
            title={`Poor ${metric.poor}`}
          />
        </div>
      ) : null}
    </div>
  );
}

function PerformanceDashboard({
  summary,
  reason,
}: {
  summary: WebVitalsSummary | null;
  reason: "ok" | "no-key" | "forbidden" | "error" | "empty";
}) {
  if (reason === "forbidden") {
    return (
      <p className="mt-3 text-sm leading-7 text-muted">
        Performance samples open only for the admin address held on the server.
      </p>
    );
  }
  if (reason === "no-key") {
    return (
      <p className="mt-3 text-sm leading-7 text-muted">
        First-party Web Vitals are not listed because the server key is not set.
      </p>
    );
  }
  if (reason === "error") {
    return (
      <p className="mt-3 text-sm leading-7 text-muted">
        Web Vitals could not be read. Apply the `web_vitals` migration
        (`20261025123000_web_vitals.sql`) if it is not on the project yet.
      </p>
    );
  }
  if (reason === "empty" || !summary || summary.sampleSize === 0) {
    return (
      <div className="mt-3 grid gap-3">
        <p className="text-sm leading-7 text-ink">
          No first-party Core Web Vitals samples yet. After the migration is applied, public pages
          report LCP, INP, and CLS into Supabase. Numbers appear here as visitors load the site.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="border border-ink/15 bg-chart px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">LCP</p>
            <p className="mt-1 text-sm leading-6 text-ink">Largest Contentful Paint</p>
            <p className="mt-1 text-xs leading-5 text-muted">Good ≤ 2.5 s</p>
          </div>
          <div className="border border-ink/15 bg-chart px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">INP</p>
            <p className="mt-1 text-sm leading-6 text-ink">Interaction to Next Paint</p>
            <p className="mt-1 text-xs leading-5 text-muted">Good ≤ 200 ms</p>
          </div>
          <div className="border border-ink/15 bg-chart px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">CLS</p>
            <p className="mt-1 text-sm leading-6 text-ink">Cumulative Layout Shift</p>
            <p className="mt-1 text-xs leading-5 text-muted">Good ≤ 0.1</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Last 7 days · p75 / median</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {summary.last7d.map((metric) => (
            <VitalCard key={`7-${metric.metric}`} metric={metric} windowLabel="7d" />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Last 30 days · p75 / median</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {summary.last30d.map((metric) => (
            <VitalCard key={`30-${metric.metric}`} metric={metric} windowLabel="30d" />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function SiteAnalyticsSection() {
  const [visits, vitals] = await Promise.all([summarizePageViews(), summarizeWebVitals()]);

  return (
    <section className="mt-8">
      <h2 className="font-display text-3xl leading-none tracking-tight">Site analytics</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Visits, countries, and Core Web Vitals on this page from first-party samples (no visitor
        IP). Vercel remains available for the full hosted product view.
      </p>

      <h3 className="mt-8 font-display text-2xl leading-none tracking-tight">Visits and location</h3>

      {visits.reason === "forbidden" ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          Visit storage opens only for the admin address held on the server.
        </p>
      ) : visits.reason === "no-key" ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          First-party visits are not listed because the server key is not set.
        </p>
      ) : visits.reason === "error" ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          First-party visits could not be read. Apply the `page_views` migration
          (`20261025120000_page_views.sql`) if it is not on the project yet (`supabase db push` or
          the SQL editor).
        </p>
      ) : visits.reason === "empty" || !visits.summary || visits.summary.total === 0 ? (
        <p className="mt-3 text-sm leading-7 text-ink">
          No first-party page views are on file yet. After `20261025120000_page_views.sql` is
          applied and the site serves traffic, totals, top pages, countries, and daily bars appear
          here.
        </p>
      ) : (
        <VisitsDashboard summary={visits.summary} />
      )}

      <h3 className="mt-10 font-display text-2xl leading-none tracking-tight">Performance</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        LCP, INP, and CLS collected in the browser and stored for this admin view. Thresholds follow
        Google’s Core Web Vitals guidance.
      </p>
      <PerformanceDashboard summary={vitals.summary} reason={vitals.reason} />

      <p className="mt-8 text-sm leading-7 text-muted">
        <a
          href="https://vercel.com/dashboard"
          className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          target="_blank"
          rel="noreferrer"
        >
          Open full Vercel Analytics
        </a>
        {" · "}
        <a
          href="https://vercel.com/docs/speed-insights"
          className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          target="_blank"
          rel="noreferrer"
        >
          Speed Insights docs
        </a>
        . Rows auto-delete after about 90 days.
      </p>
    </section>
  );
}

export function SiteAnalyticsSectionFallback() {
  return (
    <section className="mt-8">
      <h2 className="font-display text-3xl leading-none tracking-tight">Site analytics</h2>
      <p className="mt-3 text-sm leading-7 text-muted">Loading analytics…</p>
    </section>
  );
}
