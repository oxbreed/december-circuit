import type { SeriesPoint } from "../admin-dashboard";

const LAGOON = "#1b684e";
const OXIDE = "#a93d2a";
const GRID = "rgba(26, 20, 16, 0.12)";
const MUTED = "#5c5148";

function niceMax(value: number) {
  if (value <= 0) return 4;
  const padded = value * 1.15;
  const mag = 10 ** Math.floor(Math.log10(padded));
  const norm = padded / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * mag;
}

export function AdminDashboardChart({ series }: { series: SeriesPoint[] }) {
  const width = 760;
  const height = 280;
  const pad = { top: 12, right: 16, bottom: 44, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxY = niceMax(Math.max(...series.map((d) => Math.max(d.pageViews, d.clicks)), 0));
  const yTicks = 4;

  const pointAt = (index: number, value: number) => {
    const x =
      series.length <= 1
        ? pad.left + innerW / 2
        : pad.left + (index / (series.length - 1)) * innerW;
    const y = pad.top + innerH - (value / maxY) * innerH;
    return { x, y };
  };

  const pathFor = (key: "pageViews" | "clicks") =>
    series
      .map((row, index) => {
        const { x, y } = pointAt(index, row[key]);
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");

  const areaFor = (key: "pageViews" | "clicks") => {
    const line = pathFor(key);
    if (!line || series.length === 0) return "";
    const first = pointAt(0, series[0]![key]);
    const last = pointAt(series.length - 1, series[series.length - 1]![key]);
    return `${line} L ${last.x.toFixed(2)} ${(pad.top + innerH).toFixed(2)} L ${first.x.toFixed(2)} ${(pad.top + innerH).toFixed(2)} Z`;
  };

  const labelEvery = Math.max(1, Math.ceil(series.length / 8));
  const totalViews = series.reduce((sum, row) => sum + row.pageViews, 0);
  const totalClicks = series.reduce((sum, row) => sum + row.clicks, 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Page views ${totalViews.toLocaleString()} and outbound clicks ${totalClicks.toLocaleString()} over the selected period.`}
    >
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const value = (maxY / yTicks) * (yTicks - i);
        const y = pad.top + (innerH / yTicks) * i;
        return (
          <g key={`y-${i}`}>
            <line x1={pad.left} x2={pad.left + innerW} y1={y} y2={y} stroke={GRID} strokeWidth={1} />
            <text
              x={pad.left - 8}
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
      {areaFor("pageViews") ? <path d={areaFor("pageViews")} fill="rgba(27, 104, 78, 0.14)" stroke="none" /> : null}
      {pathFor("pageViews") ? (
        <path d={pathFor("pageViews")} fill="none" stroke={LAGOON} strokeWidth={2.25} />
      ) : null}
      {pathFor("clicks") ? (
        <path d={pathFor("clicks")} fill="none" stroke={OXIDE} strokeWidth={2} strokeDasharray="5 4" />
      ) : null}
      {series.map((row, index) => {
        const views = pointAt(index, row.pageViews);
        const clicks = pointAt(index, row.clicks);
        return (
          <g key={row.bucket}>
            <circle cx={views.x} cy={views.y} r={3} fill="#fffaf4" stroke={LAGOON} strokeWidth={1.75}>
              <title>
                {row.label}: {row.pageViews.toLocaleString()} page views
              </title>
            </circle>
            {row.clicks > 0 ? (
              <circle cx={clicks.x} cy={clicks.y} r={3} fill="#fffaf4" stroke={OXIDE} strokeWidth={1.75}>
                <title>
                  {row.label}: {row.clicks.toLocaleString()} clicks
                </title>
              </circle>
            ) : null}
            {index % labelEvery === 0 || index === series.length - 1 ? (
              <text
                x={views.x}
                y={height - 12}
                textAnchor="middle"
                fill={MUTED}
                style={{ fontSize: 10, fontFamily: "system-ui, sans-serif" }}
              >
                {row.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function AdminDashboardChartLegend() {
  return (
    <ul className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-sm leading-6 text-ink">
      <li className="inline-flex items-center gap-2">
        <span className="inline-block h-0.5 w-3 bg-lagoon" aria-hidden="true" />
        Page views
      </li>
      <li className="inline-flex items-center gap-2">
        <span className="inline-block h-0.5 w-3 bg-oxide" aria-hidden="true" />
        Outbound clicks
      </li>
    </ul>
  );
}
