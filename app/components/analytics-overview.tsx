"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { CountRow, DayCount, PageViewSummary } from "../page-views";

type RangeKey = "7" | "30";
type MetricTab = "sessions" | "pageviews";

const BLUE = "#2271b1";
const FILL = "rgba(34, 113, 177, 0.18)";
const GRID = "#e2e8f0";
const MUTED = "#646970";
const INK = "#1d2327";
const TAB_IDLE = "#f0f0f1";

function PersonIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={color}
        d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2h19.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z"
      />
    </svg>
  );
}

function EyeIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={color}
        d="M12 5c-5 0-9.3 3.1-11 7 1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9zm0-7.2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4z"
      />
    </svg>
  );
}

function formatAxisDate(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso.slice(5);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function niceMax(value: number) {
  if (value <= 0) return 4;
  const padded = value * 1.12;
  const mag = 10 ** Math.floor(Math.log10(padded));
  const norm = padded / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * mag;
}

function AreaLineChart({ series }: { series: DayCount[] }) {
  const width = 760;
  const height = 300;
  const pad = { top: 18, right: 18, bottom: 52, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxY = niceMax(Math.max(...series.map((d) => d.count), 0));
  const yTicks = 5;

  const points = series.map((d, i) => {
    const x =
      series.length <= 1
        ? pad.left + innerW / 2
        : pad.left + (i / (series.length - 1)) * innerW;
    const y = pad.top + innerH - (d.count / maxY) * innerH;
    return { ...d, x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  const areaPath =
    points.length === 0
      ? ""
      : `${linePath} L ${points[points.length - 1]!.x.toFixed(2)} ${(pad.top + innerH).toFixed(2)} L ${points[0]!.x.toFixed(2)} ${(pad.top + innerH).toFixed(2)} Z`;

  const labelEvery = Math.max(1, Math.ceil(series.length / 10));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Overview report chart"
    >
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const value = (maxY / yTicks) * (yTicks - i);
        const y = pad.top + (innerH / yTicks) * i;
        return (
          <g key={`y-${i}`}>
            <line
              x1={pad.left}
              x2={pad.left + innerW}
              y1={y}
              y2={y}
              stroke={GRID}
              strokeWidth={1}
            />
            <text
              x={pad.left - 10}
              y={y + 3.5}
              textAnchor="end"
              fill={MUTED}
              style={{ fontSize: 11, fontFamily: "system-ui, sans-serif" }}
            >
              {Math.round(value).toLocaleString()}
            </text>
          </g>
        );
      })}

      {areaPath ? <path d={areaPath} fill={FILL} stroke="none" /> : null}
      {linePath ? <path d={linePath} fill="none" stroke={BLUE} strokeWidth={2.25} /> : null}

      {points.map((p) => (
        <circle
          key={`pt-${p.day}`}
          cx={p.x}
          cy={p.y}
          r={4.5}
          fill="#fff"
          stroke={BLUE}
          strokeWidth={2}
        >
          <title>
            {formatAxisDate(p.day)}: {p.count.toLocaleString()}
          </title>
        </circle>
      ))}

      {points.map((p, i) =>
        i % labelEvery === 0 || i === points.length - 1 ? (
          <text
            key={`xl-${p.day}`}
            x={p.x}
            y={height - 10}
            textAnchor="end"
            fill={MUTED}
            style={{ fontSize: 10, fontFamily: "system-ui, sans-serif" }}
            transform={`rotate(-40 ${p.x} ${height - 10})`}
          >
            {formatAxisDate(p.day)}
          </text>
        ) : null,
      )}
    </svg>
  );
}

function RankedList({ title, rows }: { title: string; rows: CountRow[] }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <div>
      <h3
        className="text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: MUTED }}
      >
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm" style={{ color: MUTED }}>
          No data yet
        </p>
      ) : (
        <ul className="mt-2 divide-y" style={{ borderColor: "#e0e0e0" }}>
          {rows.map((row) => (
            <li key={row.label} className="relative py-2">
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${Math.round((row.count / max) * 100)}%`,
                  background: FILL,
                }}
              />
              <div
                className="relative flex items-baseline justify-between gap-3 text-sm"
                style={{ color: INK }}
              >
                <span className="min-w-0 truncate" title={row.label}>
                  {row.label}
                </span>
                <span className="shrink-0 tabular-nums" style={{ color: MUTED }}>
                  {row.count.toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OverviewChrome({
  range,
  onRange,
  tab,
  onTab,
  sessionsTotal,
  pageviewsTotal,
  children,
}: {
  range: RangeKey;
  onRange: (value: RangeKey) => void;
  tab: MetricTab;
  onTab: (value: MetricTab) => void;
  sessionsTotal: number;
  pageviewsTotal: number;
  children: ReactNode;
}) {
  return (
    <div
      className="mt-5 overflow-hidden bg-white"
      style={{
        border: "1px solid #c3c4c7",
        boxShadow: "0 1px 1px rgba(0,0,0,0.04)",
      }}
      data-analytics-overview="true"
    >
      <div
        className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid #dcdcde", background: "#fff" }}
      >
        <div>
          <p className="text-[13px] font-semibold" style={{ color: INK }}>
            DirtyDecember
          </p>
          <h3 className="mt-0.5 text-[20px] font-normal leading-tight" style={{ color: INK }}>
            Overview Report
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center">
            <span className="sr-only">Date range</span>
            <select
              value={range}
              onChange={(event) => onRange(event.target.value as RangeKey)}
              className="appearance-none rounded-full border bg-white px-3 py-1.5 pr-8 text-[13px] outline-none"
              style={{ borderColor: "#c3c4c7", color: BLUE }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </label>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border text-[14px]"
            style={{ borderColor: "#c3c4c7", color: MUTED }}
            aria-hidden="true"
            title="Expand"
          >
            ⤢
          </span>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border text-[14px]"
            style={{ borderColor: "#c3c4c7", color: MUTED }}
            aria-hidden="true"
            title="Settings"
          >
            ⚙
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ borderBottom: "1px solid #dcdcde" }}>
        <button
          type="button"
          onClick={() => onTab("sessions")}
          data-tab="sessions"
          className="flex items-center gap-2 px-5 py-3.5 text-left text-[14px] font-semibold"
          style={{
            color: tab === "sessions" ? BLUE : INK,
            background: tab === "sessions" ? "#fff" : TAB_IDLE,
            borderTop: tab === "sessions" ? `3px solid ${BLUE}` : "3px solid transparent",
            borderRight: "1px solid #dcdcde",
          }}
        >
          <PersonIcon color={tab === "sessions" ? BLUE : MUTED} />
          <span>Sessions</span>
          <span className="ml-auto tabular-nums text-[18px] font-semibold leading-none">
            {sessionsTotal.toLocaleString()}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onTab("pageviews")}
          data-tab="pageviews"
          className="flex items-center gap-2 px-5 py-3.5 text-left text-[14px] font-semibold"
          style={{
            color: tab === "pageviews" ? BLUE : INK,
            background: tab === "pageviews" ? "#fff" : TAB_IDLE,
            borderTop: tab === "pageviews" ? `3px solid ${BLUE}` : "3px solid transparent",
          }}
        >
          <EyeIcon color={tab === "pageviews" ? BLUE : MUTED} />
          <span>Pageviews</span>
          <span className="ml-auto tabular-nums text-[18px] font-semibold leading-none">
            {pageviewsTotal.toLocaleString()}
          </span>
        </button>
      </div>

      {children}
    </div>
  );
}

export function AnalyticsOverview({ summary }: { summary: PageViewSummary }) {
  const [range, setRange] = useState<RangeKey>("30");
  const [tab, setTab] = useState<MetricTab>("sessions");

  const series = useMemo(() => {
    if (tab === "sessions") {
      return range === "7" ? summary.sessionsDaily7 : summary.sessionsDaily30;
    }
    return range === "7" ? summary.pageviews7 : summary.pageviews30;
  }, [range, summary, tab]);

  const tops = range === "7" ? summary.tops7 : summary.tops30;
  const sessionsTotal = range === "7" ? summary.sessions7 : summary.sessions30;
  const pageviewsTotal = range === "7" ? summary.last7d : summary.last30d;
  const hasSignal = series.some((d) => d.count > 0);

  return (
    <OverviewChrome
      range={range}
      onRange={setRange}
      tab={tab}
      onTab={setTab}
      sessionsTotal={sessionsTotal}
      pageviewsTotal={pageviewsTotal}
    >
      <div className="px-3 pb-3 pt-4 sm:px-5">
        {!hasSignal ? (
          <p className="px-2 py-16 text-center text-sm" style={{ color: MUTED }}>
            No data yet for this range.
          </p>
        ) : (
          <AreaLineChart series={series} />
        )}
      </div>

      <div
        className="grid gap-6 px-5 py-5 lg:grid-cols-3"
        style={{ borderTop: "1px solid #dcdcde" }}
      >
        <RankedList title="Top pages" rows={tops.paths} />
        <RankedList title="Top countries" rows={tops.countries} />
        <RankedList title="Top sources" rows={tops.sources} />
      </div>
    </OverviewChrome>
  );
}

/** Empty / error still shows the MI card chrome so /admin never falls back to five KPI tiles. */
export function AnalyticsOverviewEmpty({
  message,
  demoSummary,
}: {
  message: string;
  demoSummary?: PageViewSummary | null;
}) {
  if (demoSummary && demoSummary.total > 0) {
    return <AnalyticsOverview summary={demoSummary} />;
  }

  return (
    <OverviewChrome
      range="30"
      onRange={() => undefined}
      tab="sessions"
      onTab={() => undefined}
      sessionsTotal={0}
      pageviewsTotal={0}
    >
      <p className="px-5 py-16 text-center text-sm" style={{ color: MUTED }} data-empty="true">
        {message}
      </p>
      <div
        className="grid gap-6 px-5 py-5 lg:grid-cols-3"
        style={{ borderTop: "1px solid #dcdcde" }}
      >
        <RankedList title="Top pages" rows={[]} />
        <RankedList title="Top countries" rows={[]} />
        <RankedList title="Top sources" rows={[]} />
      </div>
    </OverviewChrome>
  );
}
