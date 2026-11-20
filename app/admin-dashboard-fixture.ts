import type { DashboardReport, SeriesPoint } from "./admin-dashboard";

function ok<T>(data: T) {
  return { ok: true as const, reason: null, data };
}

function series7(): SeriesPoint[] {
  const days = [
    ["2026-11-14", "14 Nov", 68, 0],
    ["2026-11-15", "15 Nov", 81, 1],
    ["2026-11-16", "16 Nov", 74, 0],
    ["2026-11-17", "17 Nov", 93, 2],
    ["2026-11-18", "18 Nov", 110, 1],
    ["2026-11-19", "19 Nov", 126, 3],
    ["2026-11-20", "20 Nov", 98, 1],
  ] as const;
  return days.map(([bucket, label, pageViews, clicks]) => ({ bucket, label, pageViews, clicks }));
}

/** Deterministic sample for visual QA of Dashboard / Insights. */
export function adminDashboardFixture(): DashboardReport {
  return {
    range: "7d",
    periodStart: "2026-11-13T23:22:00.000Z",
    periodEnd: "2026-11-20T23:22:00.000Z",
    previousStart: "2026-11-06T23:22:00.000Z",
    kpis: ok({
      pageViews: 650,
      pageViewsDelta: 12.4,
      sessions: 214,
      sessionsDelta: 8.1,
      clicks: 8,
      clicksDelta: null,
      ctr: 8 / 650,
      ctrDelta: null,
      earningClicks: 0,
      earningClicksDelta: 0,
      submissions: 0,
      submissionsDelta: 0,
    }),
    series: ok(series7()),
    topPages: ok([
      { label: "/", href: "/", count: 210 },
      { label: "/events", href: "/events", count: 118 },
      { label: "/places", href: "/places", count: 86 },
      { label: "/guide", href: "/guide", count: 54 },
      { label: "/map", href: "/map", count: 41 },
      { label: "/flights", href: "/flights", count: 33 },
      { label: "/about", href: "/about", count: 22 },
      { label: "/visa", href: "/visa", count: 18 },
    ]),
    topReferrers: ok([
      { label: "google.com", count: 94 },
      { label: "t.co", count: 18 },
      { label: "instagram.com", count: 11 },
    ]),
    topCountries: ok([
      { label: "United States", count: 312 },
      { label: "United Kingdom", count: 241 },
      { label: "Nigeria", count: 48 },
      { label: "Netherlands", count: 21 },
      { label: "Ireland", count: 8 },
    ]),
    topDevices: ok([
      { label: "Mobile", count: 390 },
      { label: "Desktop", count: 232 },
      { label: "Tablet", count: 28 },
    ]),
    topBrowsers: ok([
      { label: "Chrome", count: 348 },
      { label: "Safari", count: 186 },
      { label: "Firefox", count: 62 },
      { label: "Edge", count: 31 },
      { label: "Other", count: 23 },
    ]),
    topPartners: ok([
      { label: "booking", count: 5 },
      { label: "getyourguide", count: 3 },
    ]),
    topPlacements: ok([
      { label: "event-card", count: 4 },
      { label: "place-sidebar", count: 3 },
      { label: "guide-inline", count: 1 },
    ]),
    topClickPaths: ok([
      { label: "/events", href: "/events", count: 4 },
      { label: "/places", href: "/places", count: 3 },
      { label: "/guide", href: "/guide", count: 1 },
    ]),
    vitals: ok([
      {
        metric: "LCP",
        p75: 1628,
        unit: "ms",
        rating: "good",
        samples: 420,
        good: 2500,
        poor: 4000,
      },
      {
        metric: "INP",
        p75: 184,
        unit: "ms",
        rating: "good",
        samples: 390,
        good: 200,
        poor: 500,
      },
      {
        metric: "CLS",
        p75: 0.005,
        unit: "score",
        rating: "good",
        samples: 410,
        good: 0.1,
        poor: 0.25,
      },
    ]),
    activity: ok([
      {
        id: "click-1",
        kind: "click",
        title: "booking: Lagos hotels",
        detail: "partner · event-card",
        ts: "2026-11-20T18:12:00.000Z",
      },
      {
        id: "click-2",
        kind: "click",
        title: "getyourguide: Accra tours",
        detail: "partner · place-sidebar",
        ts: "2026-11-19T14:04:00.000Z",
      },
    ]),
  };
}
