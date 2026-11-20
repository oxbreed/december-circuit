import Link from "next/link";
import type { ReactNode } from "react";
import {
  loadAdminDashboard,
  parseDashboardRange,
  rangeLabel,
  type ActivityItem,
  type CountRow,
  type DashboardKpis,
  type DashboardReport,
  type DashboardWidget,
  type VitalTile,
} from "../admin-dashboard";
import { AdminDashboardChart, AdminDashboardChartLegend } from "./admin-dashboard-chart";
import { AdminDashboardRange } from "./admin-dashboard-range";

function formatDelta(value: number | null) {
  if (value === null) return { text: "No previous period", tone: "text-muted" };
  if (value === 0) return { text: "No change", tone: "text-muted" };
  const rounded = Math.abs(value) >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  const sign = value > 0 ? "+" : "";
  return {
    text: `${sign}${rounded}% vs previous period`,
    tone: value > 0 ? "text-lagoon" : "text-oxide",
  };
}

function formatCount(value: number) {
  return value.toLocaleString("en-GB");
}

function formatPercent(value: number | null) {
  if (value === null) return "No data";
  const pct = value * 100;
  if (pct === 0) return "0%";
  if (pct < 0.1) return "<0.1%";
  if (pct < 10) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}

function formatVital(tile: VitalTile) {
  if (tile.p75 === null) return "No data";
  if (tile.unit === "score") return tile.p75 < 0.01 ? tile.p75.toFixed(3) : tile.p75.toFixed(2);
  if (tile.p75 >= 1000) return `${(tile.p75 / 1000).toFixed(1)}s`;
  return `${Math.round(tile.p75)}ms`;
}

function vitalLabel(rating: VitalTile["rating"]) {
  if (rating === "good") return "Good";
  if (rating === "needs-improvement") return "Needs improvement";
  if (rating === "poor") return "Poor";
  return "No samples";
}

function vitalTone(rating: VitalTile["rating"]) {
  if (rating === "good") return "text-lagoon";
  if (rating === "needs-improvement") return "text-brass";
  if (rating === "poor") return "text-oxide";
  return "text-muted";
}

function formatStamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function formatRangeBounds(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  return `${fmt.format(start)} to ${fmt.format(end)} London time`;
}

function KpiCard({
  label,
  value,
  delta,
  note,
}: {
  label: string;
  value: string;
  delta: number | null;
  note?: string;
}) {
  const change = formatDelta(delta);
  return (
    <li className="border border-ink/15 bg-chart px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl leading-none tracking-tight whitespace-nowrap tabular-nums sm:text-3xl">{value}</p>
      <p className={`mt-2 text-sm leading-6 ${change.tone}`}>{change.text}</p>
      {note ? <p className="mt-1 text-sm leading-6 text-muted">{note}</p> : null}
    </li>
  );
}

function Widget({
  title,
  widget,
  empty,
  children,
}: {
  title: string;
  widget: DashboardWidget<unknown>;
  empty?: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-ink/15 bg-chart px-4 py-4">
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">{title}</h3>
      {widget.reason ? (
        <p className="mt-3 text-sm leading-7 text-muted">{widget.reason}</p>
      ) : !widget.data || (Array.isArray(widget.data) && widget.data.length === 0) ? (
        <p className="mt-3 text-sm leading-7 text-muted">{empty ?? "No data in this period."}</p>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </section>
  );
}

function RankedList({ rows }: { rows: CountRow[] }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <ul className="grid gap-2">
      {rows.map((row) => (
        <li key={row.label} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-sm leading-6">
            {row.href ? (
              <Link
                href={row.href}
                className="min-w-0 truncate underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {row.label}
              </Link>
            ) : (
              <span className="min-w-0 truncate" title={row.label}>
                {row.label}
              </span>
            )}
            <span className="shrink-0 tabular-nums text-muted">{formatCount(row.count)}</span>
          </div>
          <div className="mt-1 h-1 bg-paper-deep" aria-hidden="true">
            <div
              className="h-1 bg-lagoon/70"
              style={{ width: `${Math.max(6, Math.round((row.count / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function KpiGrid({ widget }: { widget: DashboardWidget<DashboardKpis> }) {
  if (!widget.ok || !widget.data) {
    return (
      <p className="mt-6 text-sm leading-7 text-muted">
        {widget.reason ?? "Totals unavailable."}
      </p>
    );
  }
  const k = widget.data;
  return (
    <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <KpiCard
        label="Page views"
        value={formatCount(k.pageViews)}
        delta={k.pageViewsDelta}
      />
      <KpiCard
        label="Approximate sessions"
        value={formatCount(k.sessions)}
        delta={k.sessionsDelta}
        note="Views that share a country and browser string are grouped. This site does not store a visitor id."
      />
      <KpiCard label="Outbound clicks" value={formatCount(k.clicks)} delta={k.clicksDelta} />
      <KpiCard
        label="Click-through"
        value={formatPercent(k.ctr)}
        delta={k.ctrDelta}
        note="Outbound clicks divided by page views."
      />
      <KpiCard
        label="Partner earning clicks"
        value={formatCount(k.earningClicks)}
        delta={k.earningClicksDelta}
        note="Clicks marked as earning, when a partner ID is set."
      />
      <KpiCard label="Submissions" value={formatCount(k.submissions)} delta={k.submissionsDelta} />
    </ul>
  );
}

function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="grid gap-3">
      {items.map((item) => (
        <li key={item.id} className="border-t border-ink/10 pt-3 first:border-t-0 first:pt-0">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
            {item.kind === "click" ? "Click" : "Submission"} · {formatStamp(item.ts)}
          </p>
          <p className="mt-1 text-sm leading-6 text-ink">{item.title}</p>
          <p className="text-sm leading-6 text-muted">{item.detail}</p>
        </li>
      ))}
    </ol>
  );
}

export function AdminDashboardView({
  report,
}: {
  report: DashboardReport;
}) {
  const bounds = formatRangeBounds(report.periodStart, report.periodEnd);

  return (
    <section className="min-w-0" data-admin-analytics="insights">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-3xl leading-none tracking-tight">Dashboard / Insights</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            First-party traffic for dirtydecember.info. {rangeLabel(report.range)}. {bounds}. Bot user
            agents are left out of page view totals. The migration test click is left out of click
            totals.
          </p>
        </div>
        <AdminDashboardRange range={report.range} />
      </div>

      <KpiGrid widget={report.kpis} />

      <div className="mt-6">
        <Widget
          title="Page views and clicks"
          widget={
            report.series.ok && report.series.data && report.series.data.every((p) => p.pageViews === 0 && p.clicks === 0)
              ? { ok: true, reason: null, data: [] }
              : report.series
          }
          empty="No traffic in this period yet."
        >
          {report.series.data ? (<><AdminDashboardChartLegend /><AdminDashboardChart series={report.series.data} /></>) : null}
        </Widget>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Widget title="Top pages" widget={report.topPages} empty="No pages recorded in this period.">
          {report.topPages.data ? <RankedList rows={report.topPages.data} /> : null}
        </Widget>
        <Widget
          title="Top referrers"
          widget={report.topReferrers}
          empty="No external referrers in this period."
        >
          {report.topReferrers.data ? <RankedList rows={report.topReferrers.data} /> : null}
        </Widget>
        <Widget
          title="Countries"
          widget={report.topCountries}
          empty="No country data in this period."
        >
          {report.topCountries.data ? <RankedList rows={report.topCountries.data} /> : null}
        </Widget>
        <Widget title="Devices" widget={report.topDevices} empty="No device data in this period.">
          {report.topDevices.data ? <RankedList rows={report.topDevices.data} /> : null}
        </Widget>
        <Widget title="Browsers" widget={report.topBrowsers} empty="No browser data in this period.">
          {report.topBrowsers.data ? <RankedList rows={report.topBrowsers.data} /> : null}
        </Widget>
        <Widget
          title="Partners"
          widget={report.topPartners}
          empty="No partner clicks in this period."
        >
          {report.topPartners.data ? <RankedList rows={report.topPartners.data} /> : null}
        </Widget>
        <Widget
          title="Placements"
          widget={report.topPlacements}
          empty="No placement labels in this period."
        >
          {report.topPlacements.data ? <RankedList rows={report.topPlacements.data} /> : null}
        </Widget>
        <Widget
          title="Paths that sent clicks"
          widget={report.topClickPaths}
          empty="No click source paths in this period."
        >
          {report.topClickPaths.data ? <RankedList rows={report.topClickPaths.data} /> : null}
        </Widget>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Widget
          title="Core Web Vitals, p75"
          widget={report.vitals}
          empty="No Web Vitals samples in this period."
        >
          {report.vitals.data ? (
            <ul className="grid gap-3 sm:grid-cols-3">
              {report.vitals.data.map((tile) => (
                <li key={tile.metric}>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{tile.metric}</p>
                  <p
                    className={`mt-1 font-display text-3xl leading-none tracking-tight tabular-nums ${vitalTone(tile.rating)}`}
                  >
                    {formatVital(tile)}
                  </p>
                  <p className={`mt-2 text-sm leading-6 ${vitalTone(tile.rating)}`}>
                    {vitalLabel(tile.rating)}
                    {tile.samples > 0 ? ` · ${formatCount(tile.samples)} samples` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </Widget>
        <Widget
          title="Recent activity"
          widget={report.activity}
          empty="No clicks or submissions in this period."
        >
          {report.activity.data ? <ActivityList items={report.activity.data} /> : null}
        </Widget>
      </div>
    </section>
  );
}

export async function AdminDashboardSection({
  range: rawRange,
}: {
  range?: string | string[];
}) {
  const range = parseDashboardRange(rawRange);
  const { report } = await loadAdminDashboard(range);
  return <AdminDashboardView report={report} />;
}

export function AdminDashboardSectionFallback() {
  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Dashboard / Insights</h2>
      <p className="mt-3 text-sm leading-7 text-muted">Loading insights…</p>
    </section>
  );
}
