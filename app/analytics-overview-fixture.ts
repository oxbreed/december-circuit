import type { DayCount, PageViewSummary } from "./page-views";

function daysBack(count: number, values: number[]): DayCount[] {
  // Fixed end date so the preview page can prerender under cacheComponents.
  const end = Date.parse("2026-10-25T12:00:00.000Z");
  const out: DayCount[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const day = new Date(end - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    out.push({ day, count: values[count - 1 - i] ?? values[values.length - 1] ?? 0 });
  }
  return out;
}

/** Deterministic sample for visual QA of the Overview Report card. */
export function analyticsOverviewFixture(): PageViewSummary {
  const pageviews30 = daysBack(30, [
    42, 48, 51, 47, 55, 60, 58, 62, 70, 68, 74, 80, 77, 85, 90, 88, 95, 102, 98, 110, 115, 108,
    120, 125, 118, 130, 128, 135, 140, 138,
  ]);
  const sessions30 = daysBack(30, [
    28, 30, 33, 31, 36, 38, 37, 40, 44, 42, 46, 50, 48, 52, 55, 54, 58, 62, 60, 66, 70, 65, 72,
    75, 71, 78, 76, 80, 84, 82,
  ]);
  const pageviews7 = pageviews30.slice(-7);
  const sessionsDaily7 = sessions30.slice(-7);

  return {
    total: 2400,
    last24h: 138,
    last7d: pageviews7.reduce((s, d) => s + d.count, 0),
    last30d: pageviews30.reduce((s, d) => s + d.count, 0),
    uniquePaths: 24,
    uniqueCountries: 9,
    sessions7: sessionsDaily7.reduce((s, d) => s + d.count, 0),
    sessions30: sessions30.reduce((s, d) => s + d.count, 0),
    pageviews7,
    pageviews30,
    sessionsDaily7,
    sessionsDaily30: sessions30,
    tops7: {
      paths: [
        { label: "/", count: 210 },
        { label: "/events", count: 96 },
        { label: "/flights", count: 64 },
        { label: "/guide", count: 41 },
      ],
      countries: [
        { label: "NG", count: 180 },
        { label: "GB", count: 72 },
        { label: "US", count: 55 },
      ],
      sources: [
        { label: "google.com", count: 88 },
        { label: "instagram.com", count: 34 },
      ],
    },
    tops30: {
      paths: [
        { label: "/", count: 820 },
        { label: "/events", count: 410 },
        { label: "/flights", count: 260 },
        { label: "/explore", count: 180 },
        { label: "/guide", count: 140 },
      ],
      countries: [
        { label: "NG", count: 980 },
        { label: "GB", count: 320 },
        { label: "US", count: 260 },
        { label: "GH", count: 120 },
        { label: "CA", count: 90 },
      ],
      sources: [
        { label: "google.com", count: 410 },
        { label: "instagram.com", count: 160 },
        { label: "twitter.com", count: 70 },
      ],
    },
    sampleSize: 2400,
  };
}
