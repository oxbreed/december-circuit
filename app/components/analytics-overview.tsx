"use client";

import { useMemo, useState } from "react";
import type { CountRow, DayCount, PageViewSummary } from "../page-views";

type RangeKey = "7" | "30";
type MetricTab = "sessions" | "pageviews";

const CHART_BLUE = "#2271b1";
const CHART_FILL = "rgba(34, 113, 177, 0.16)";
const GRID = "rgba(34, 113, 177, 0.12)";

function formatAxisDate(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso.slice(5);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function niceMax(value: number) {
  if (value <= 0) return 4;
  const padded = value * 1.15;
  const mag = 10 ** Math.floor(Math.log10(padded));
  const norm = padded / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * mag;
}

function AreaLineChart({ series }: { series: DayCount[] }) {
  const width = 720;
  const height = 280;
  const pad = { top: 16, right: 16, bottom: 44, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxY = niceMax(Math.max(...series.map((d) => d.count), 0));
  const yTicks = 4;
  const points = series.map((d, i) => {
    const x =
      series.length <= 1
        ? pad.left + innerW / 2
        : pad.left + (i / (series.length - 1)) * innerW;
    const y = pad.top + innerH - (d.count / maxY) * innerH;
    return { ...d, x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    points.length === 0
      ? ""
      : `${linePath} L ${points[points.length - 1]!.x.toFixed(1)} ${(pad.top + innerH).toFixed(1)} L ${points[0]!.x.toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`;

  const labelEvery = Math.max(1, Math.ceil(series.length / 8));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Analytics trend chart"
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
              x={pad.left - 8}
              y={y + 3}
              textAnchor="end"
              className="fill-muted"
              style={{ fontSize: 10 }}
            >
              {Math.round(value).toLocaleString()}
            </text>
          </g>
        );
      })}

      {points.map((p) => (
        <line
          key={`gx-${p.day}`}
          x1={p.x}
          x2={p.x}
          y1={pad.top}
          y2={pad.top + innerH}
          stroke={GRID}
          strokeWidth={1}
        />
      ))}

      {areaPath ? <path d={areaPath} fill={CHART_FILL} stroke="none" /> : null}
      {linePath ? (
        <path d={linePath} fill="none" stroke={CHART_BLUE} strokeWidth={2.5} />
      ) : null}

      {points.map((p) => (
        <circle
          key={`pt-${p.day}`}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="#fff"
          stroke={CHART_BLUE}
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
            y={height - 12}
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 10 }}
            transform={`rotate(-35 ${p.x} ${height - 12})`}
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
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No data yet</p>
      ) : (
        <ul className="mt-2 divide-y divide-ink/10">
          {rows.map((row) => (
            <li key={row.label} className="relative py-2">
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${Math.round((row.count / max) * 100)}%`,
                  background: CHART_FILL,
                }}
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
  const total =
    tab === "sessions"
      ? range === "7"
        ? summary.sessions7
        : summary.sessions30
      : range === "7"
        ? summary.last7d
        : summary.last30d;

  const hasSignal = series.some((d) => d.count > 0);

  return (
    <div className="mt-5 overflow-hidden rounded-sm border border-ink/15 bg-white shadow-[0_1px_2px_rgba(26,20,16,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 px-4 py-4 sm:px-5">
        <div>
          <p className="text-sm font-semibold text-ink">DirtyDecember</p>
          <h3 className="mt-0.5 text-lg font-semibold leading-tight text-ink">Overview Report</h3>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <span className="sr-only">Date range</span>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as RangeKey)}
            className="rounded-full border border-ink/20 bg-chart px-3 py-1.5 text-sm text-ink outline-none focus:border-[#2271b1]"
            style={{ color: CHART_BLUE }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 border-b border-ink/10">
        <button
          type="button"
          onClick={() => setTab("sessions")}
          className="px-4 py-3 text-left text-sm font-semibold sm:px-5"
          style={{
            color: tab === "sessions" ? CHART_BLUE : "#1a1410",
            background: tab === "sessions" ? "#fff" : "#f6f4f1",
            borderTop: tab === "sessions" ? `3px solid ${CHART_BLUE}` : "3px solid transparent",
          }}
        >
          Sessions
          <span className="mt-1 block text-2xl font-semibold tabular-nums leading-none">
            {range === "7" ? summary.sessions7 : summary.sessions30}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("pageviews")}
          className="px-4 py-3 text-left text-sm font-semibold sm:px-5"
          style={{
            color: tab === "pageviews" ? CHART_BLUE : "#1a1410",
            background: tab === "pageviews" ? "#fff" : "#f6f4f1",
            borderTop: tab === "pageviews" ? `3px solid ${CHART_BLUE}` : "3px solid transparent",
          }}
        >
          Pageviews
          <span className="mt-1 block text-2xl font-semibold tabular-nums leading-none">
            {range === "7" ? summary.last7d : summary.last30d}
          </span>
        </button>
      </div>

      <div className="px-2 pb-2 pt-3 sm:px-4">
        {!hasSignal ? (
          <p className="px-3 py-16 text-center text-sm text-muted">No data yet for this range.</p>
        ) : (
          <>
            <p className="px-2 text-xs text-muted sm:px-1">
              {tab === "sessions" ? "Sessions" : "Pageviews"} · {total.toLocaleString()} total
            </p>
            <AreaLineChart series={series} />
          </>
        )}
      </div>

      <div className="grid gap-6 border-t border-ink/10 px-4 py-5 sm:px-5 lg:grid-cols-3">
        <RankedList title="Top pages" rows={tops.paths} />
        <RankedList title="Top countries" rows={tops.countries} />
        <RankedList title="Top sources" rows={tops.sources} />
      </div>
    </div>
  );
}

export function AnalyticsOverviewEmpty({ message }: { message: string }) {
  return (
    <div className="mt-5 overflow-hidden rounded-sm border border-ink/15 bg-white">
      <div className="border-b border-ink/10 px-4 py-4 sm:px-5">
        <p className="text-sm font-semibold text-ink">DirtyDecember</p>
        <h3 className="mt-0.5 text-lg font-semibold leading-tight text-ink">Overview Report</h3>
      </div>
      <p className="px-4 py-16 text-center text-sm text-muted sm:px-5">{message}</p>
    </div>
  );
}
