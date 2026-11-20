import "server-only";
import { directorySignIn, isAdminEmail } from "./directory-auth";
import { createServiceClient } from "./supabase/server";
import { getDirectoryUser } from "./supabase/session";

export const dashboardRanges = ["24h", "7d", "30d", "90d"] as const;
export type DashboardRange = (typeof dashboardRanges)[number];

export type CountRow = { label: string; href?: string; count: number };

export type SeriesPoint = { bucket: string; label: string; pageViews: number; clicks: number };

export type VitalTile = {
  metric: "LCP" | "INP" | "CLS";
  p75: number | null;
  unit: "ms" | "score";
  rating: "good" | "needs-improvement" | "poor" | "none";
  samples: number;
  good: number;
  poor: number;
};

export type ActivityItem = {
  id: string;
  kind: "click" | "submission";
  title: string;
  detail: string;
  ts: string;
};

export type DashboardKpis = {
  pageViews: number;
  pageViewsDelta: number | null;
  sessions: number;
  sessionsDelta: number | null;
  clicks: number;
  clicksDelta: number | null;
  ctr: number | null;
  ctrDelta: number | null;
  earningClicks: number;
  earningClicksDelta: number | null;
  submissions: number;
  submissionsDelta: number | null;
};

export type DashboardWidget<T> = {
  ok: boolean;
  reason: string | null;
  data: T | null;
};

export type DashboardReport = {
  range: DashboardRange;
  periodStart: string;
  periodEnd: string;
  previousStart: string;
  kpis: DashboardWidget<DashboardKpis>;
  series: DashboardWidget<SeriesPoint[]>;
  topPages: DashboardWidget<CountRow[]>;
  topReferrers: DashboardWidget<CountRow[]>;
  topCountries: DashboardWidget<CountRow[]>;
  topDevices: DashboardWidget<CountRow[]>;
  topBrowsers: DashboardWidget<CountRow[]>;
  topPartners: DashboardWidget<CountRow[]>;
  topPlacements: DashboardWidget<CountRow[]>;
  topClickPaths: DashboardWidget<CountRow[]>;
  vitals: DashboardWidget<VitalTile[]>;
  activity: DashboardWidget<ActivityItem[]>;
};

const TEST_PLACEMENT = "admin-migration-verify";
const BOT_UA = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|bytespider/i;
const VITAL_THRESHOLDS: Record<VitalTile["metric"], { good: number; poor: number; unit: VitalTile["unit"] }> = {
  LCP: { good: 2500, poor: 4000, unit: "ms" },
  INP: { good: 200, poor: 500, unit: "ms" },
  CLS: { good: 0.1, poor: 0.25, unit: "score" },
};

const rangeMs: Record<DashboardRange, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "90d": 90 * 24 * 60 * 60 * 1000,
};

export function parseDashboardRange(value: string | string[] | undefined): DashboardRange {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && (dashboardRanges as readonly string[]).includes(raw)) return raw as DashboardRange;
  return "7d";
}

export function rangeLabel(range: DashboardRange) {
  if (range === "24h") return "Last 24 hours";
  if (range === "7d") return "Last 7 days";
  if (range === "30d") return "Last 30 days";
  return "Last 90 days";
}

async function requireAdminService() {
  const auth = directorySignIn();
  if (!auth.connected) return { ok: false as const, reason: "no-key" as const };
  const user = await getDirectoryUser();
  if (!user || !isAdminEmail(user.email)) {
    return { ok: false as const, reason: "forbidden" as const };
  }
  const supabase = createServiceClient();
  if (!supabase) return { ok: false as const, reason: "no-key" as const };
  return { ok: true as const, supabase };
}

function gateMessage(reason: "no-key" | "forbidden"): string {
  if (reason === "forbidden") return "Admin only.";
  return "Database not connected. The server key is not set.";
}

function fail<T>(scope: string, error: unknown, reason: string): DashboardWidget<T> {
  console.error(`Admin dashboard: ${scope}`, error);
  return { ok: false, reason, data: null };
}

function ok<T>(data: T): DashboardWidget<T> {
  return { ok: true, reason: null, data };
}

function emptyReport(range: DashboardRange, period: Period, reason: string | null): DashboardReport {
  const blank = <T,>(extra?: string | null): DashboardWidget<T> => ({
    ok: !reason,
    reason: reason ?? extra ?? null,
    data: null,
  });
  return {
    range,
    periodStart: period.start.toISOString(),
    periodEnd: period.end.toISOString(),
    previousStart: period.previousStart.toISOString(),
    kpis: blank(),
    series: blank(),
    topPages: blank(),
    topReferrers: blank(),
    topCountries: blank(),
    topDevices: blank(),
    topBrowsers: blank(),
    topPartners: blank(),
    topPlacements: blank(),
    topClickPaths: blank(),
    vitals: blank(),
    activity: blank(),
  };
}

type Period = { start: Date; end: Date; previousStart: Date; range: DashboardRange };

function periodFor(range: DashboardRange, end = new Date()): Period {
  const ms = rangeMs[range];
  const start = new Date(end.getTime() - ms);
  const previousStart = new Date(start.getTime() - ms);
  return { start, end, previousStart, range };
}

function inCurrent(ts: string, period: Period) {
  const ms = Date.parse(ts);
  return !Number.isNaN(ms) && ms >= period.start.getTime() && ms < period.end.getTime();
}

function isBotUa(ua: string | null) {
  return Boolean(ua && BOT_UA.test(ua));
}

function isTestClick(placement: string | null) {
  return placement === TEST_PLACEMENT;
}

function hostFromReferrer(referrer: string) {
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, "") || referrer;
  } catch {
    return referrer;
  }
}

function countryName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function deviceFromUa(ua: string | null) {
  if (!ua) return "Unknown";
  if (BOT_UA.test(ua)) return "Bot";
  if (/iPad/i.test(ua)) return "Tablet";
  if (/Mobile|iPhone|Android/i.test(ua) && !/Android.*Tablet/i.test(ua)) return "Mobile";
  return "Desktop";
}

function browserFromUa(ua: string | null) {
  if (!ua) return "Unknown";
  if (BOT_UA.test(ua)) return "Bot";
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  return "Other";
}

function sessionKey(country: string | null, ua: string | null) {
  return `${country ?? "??"}|${(ua ?? "unknown").slice(0, 80)}`;
}

function topMap(map: Map<string, number>, limit = 8): CountRow[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function delta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function ctr(clicks: number, views: number) {
  if (views <= 0) return null;
  return clicks / views;
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo] ?? null;
  const weight = idx - lo;
  return (sorted[lo] ?? 0) * (1 - weight) + (sorted[hi] ?? 0) * weight;
}

function vitalRating(metric: VitalTile["metric"], value: number | null): VitalTile["rating"] {
  if (value === null) return "none";
  const t = VITAL_THRESHOLDS[metric];
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

const londonDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const londonHour = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

function bucketKey(iso: string, range: DashboardRange) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  if (range === "24h") {
    const parts = Object.fromEntries(
      londonHour.formatToParts(date).map((part) => [part.type, part.value]),
    );
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}`;
  }
  return londonDay.format(date);
}

function bucketLabel(key: string, range: DashboardRange) {
  if (range === "24h") {
    const hour = key.slice(-2);
    return `${hour}:00`;
  }
  const date = new Date(`${key}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return key;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(date);
}

function fillBuckets(
  range: DashboardRange,
  period: Period,
  views: Map<string, number>,
  clicks: Map<string, number>,
): SeriesPoint[] {
  const keys: string[] = [];
  if (range === "24h") {
    for (let i = 23; i >= 0; i -= 1) {
      const date = new Date(period.end.getTime() - i * 60 * 60 * 1000);
      const key = bucketKey(date.toISOString(), range);
      if (key) keys.push(key);
    }
  } else {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(period.end.getTime() - i * 24 * 60 * 60 * 1000);
      const key = bucketKey(date.toISOString(), range);
      if (key) keys.push(key);
    }
  }
  const seen = new Set<string>();
  const unique = keys.filter((key) => {
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.map((key) => ({
    bucket: key,
    label: bucketLabel(key, range),
    pageViews: views.get(key) ?? 0,
    clicks: clicks.get(key) ?? 0,
  }));
}

type ViewRow = {
  path: string | null;
  country: string | null;
  referrer: string | null;
  ua: string | null;
  ts: string;
};

type ClickRow = {
  id: string;
  kind: string | null;
  partner: string | null;
  target: string | null;
  destination_host: string | null;
  placement: string | null;
  from_path: string | null;
  ts: string;
  earning: boolean | null;
};

type SubmissionRow = {
  id: string;
  kind: string | null;
  event_name: string | null;
  business_name: string | null;
  product_name: string | null;
  city: string | null;
  created_at: string;
};

type VitalRow = { metric: string | null; value: number | null; ts: string };

function clickTitle(row: ClickRow) {
  const partner = row.partner || row.destination_host || "Outbound click";
  if (row.target) return `${partner}: ${row.target}`;
  return partner;
}

function submissionTitle(row: SubmissionRow) {
  return row.event_name || row.business_name || row.product_name || row.kind || "Submission";
}

export async function loadAdminDashboard(
  range: DashboardRange,
): Promise<{ report: DashboardReport; reason: "ok" | "no-key" | "forbidden" }> {
  const period = periodFor(range);
  const gate = await requireAdminService();
  if (!gate.ok) {
    return { report: emptyReport(range, period, gateMessage(gate.reason)), reason: gate.reason };
  }

  const supabase = gate.supabase;
  const since = period.previousStart.toISOString();
  const until = period.end.toISOString();

  const viewsResult = await (async () => {
    try {
      const { data, error } = await supabase
        .from("page_views")
        .select("path, country, referrer, ua, ts")
        .gte("ts", since)
        .lt("ts", until)
        .order("ts", { ascending: false })
        .limit(20000);
      if (error) throw error;
      return { ok: true as const, rows: (data ?? []) as ViewRow[] };
    } catch (error) {
      return { ok: false as const, error };
    }
  })();

  const clicksResult = await (async () => {
    try {
      const { data, error } = await supabase
        .from("outbound_clicks")
        .select("id, kind, partner, target, destination_host, placement, from_path, ts, earning")
        .gte("ts", since)
        .lt("ts", until)
        .order("ts", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return { ok: true as const, rows: (data ?? []) as ClickRow[] };
    } catch (error) {
      return { ok: false as const, error };
    }
  })();

  const submissionsResult = await (async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("id, kind, event_name, business_name, product_name, city, created_at")
        .gte("created_at", since)
        .lt("created_at", until)
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return { ok: true as const, rows: (data ?? []) as SubmissionRow[] };
    } catch (error) {
      return { ok: false as const, error };
    }
  })();

  const vitalsResult = await (async () => {
    try {
      const { data, error } = await supabase
        .from("web_vitals")
        .select("metric, value, ts")
        .in("metric", ["LCP", "INP", "CLS"])
        .gte("ts", period.start.toISOString())
        .lt("ts", until)
        .order("ts", { ascending: false })
        .limit(20000);
      if (error) throw error;
      return { ok: true as const, rows: (data ?? []) as VitalRow[] };
    } catch (error) {
      return { ok: false as const, error };
    }
  })();

  const currentViews = viewsResult.ok
    ? viewsResult.rows.filter((row) => inCurrent(row.ts, period) && !isBotUa(row.ua))
    : [];
  const previousViews = viewsResult.ok
    ? viewsResult.rows.filter((row) => !inCurrent(row.ts, period) && !isBotUa(row.ua))
    : [];
  const currentClicks = clicksResult.ok
    ? clicksResult.rows.filter((row) => inCurrent(row.ts, period) && !isTestClick(row.placement))
    : [];
  const previousClicks = clicksResult.ok
    ? clicksResult.rows.filter((row) => !inCurrent(row.ts, period) && !isTestClick(row.placement))
    : [];
  const currentSubs = submissionsResult.ok
    ? submissionsResult.rows.filter((row) => inCurrent(row.created_at, period))
    : [];
  const previousSubs = submissionsResult.ok
    ? submissionsResult.rows.filter((row) => !inCurrent(row.created_at, period))
    : [];

  let kpis: DashboardWidget<DashboardKpis>;
  let series: DashboardWidget<SeriesPoint[]>;
  let topPages: DashboardWidget<CountRow[]>;
  let topReferrers: DashboardWidget<CountRow[]>;
  let topCountries: DashboardWidget<CountRow[]>;
  let topDevices: DashboardWidget<CountRow[]>;
  let topBrowsers: DashboardWidget<CountRow[]>;

  if (!viewsResult.ok) {
    const failed = fail<never>("page views", viewsResult.error, "Page views unavailable.");
    kpis = { ok: false, reason: "Page views unavailable.", data: null };
    series = failed;
    topPages = failed;
    topReferrers = failed;
    topCountries = failed;
    topDevices = failed;
    topBrowsers = failed;
  } else {
    try {
      const pageViews = currentViews.length;
      const prevViews = previousViews.length;
      const sessions = new Set(currentViews.map((row) => sessionKey(row.country, row.ua))).size;
      const prevSessions = new Set(previousViews.map((row) => sessionKey(row.country, row.ua))).size;
      const clicks = currentClicks.length;
      const prevClicksCount = previousClicks.length;
      const earningClicks = currentClicks.filter((row) => row.earning).length;
      const prevEarning = previousClicks.filter((row) => row.earning).length;
      const submissions = currentSubs.length;
      const prevSubmissions = previousSubs.length;
      const currentCtr = ctr(clicks, pageViews);
      const previousCtr = ctr(prevClicksCount, prevViews);

      kpis = ok({
        pageViews,
        pageViewsDelta: delta(pageViews, prevViews),
        sessions,
        sessionsDelta: delta(sessions, prevSessions),
        clicks,
        clicksDelta: delta(clicks, prevClicksCount),
        ctr: currentCtr,
        ctrDelta: currentCtr === null || previousCtr === null ? null : delta(currentCtr, previousCtr),
        earningClicks,
        earningClicksDelta: delta(earningClicks, prevEarning),
        submissions,
        submissionsDelta: delta(submissions, prevSubmissions),
      });

      const viewBuckets = new Map<string, number>();
      const clickBuckets = new Map<string, number>();
      for (const row of currentViews) {
        const key = bucketKey(row.ts, range);
        if (key) viewBuckets.set(key, (viewBuckets.get(key) ?? 0) + 1);
      }
      for (const row of currentClicks) {
        const key = bucketKey(row.ts, range);
        if (key) clickBuckets.set(key, (clickBuckets.get(key) ?? 0) + 1);
      }
      series = ok(fillBuckets(range, period, viewBuckets, clickBuckets));

      const paths = new Map<string, number>();
      const referrers = new Map<string, number>();
      const countries = new Map<string, number>();
      const devices = new Map<string, number>();
      const browsers = new Map<string, number>();
      for (const row of currentViews) {
        if (row.path) paths.set(row.path, (paths.get(row.path) ?? 0) + 1);
        if (row.country) {
          const label = countryName(row.country);
          countries.set(label, (countries.get(label) ?? 0) + 1);
        }
        if (row.referrer) {
          const host = hostFromReferrer(row.referrer);
          if (host && !host.includes("dirtydecember.info")) {
            referrers.set(host, (referrers.get(host) ?? 0) + 1);
          }
        }
        const device = deviceFromUa(row.ua);
        devices.set(device, (devices.get(device) ?? 0) + 1);
        const browser = browserFromUa(row.ua);
        browsers.set(browser, (browsers.get(browser) ?? 0) + 1);
      }
      topPages = ok(topMap(paths).map((row) => ({ ...row, href: row.label.startsWith("/") ? row.label : undefined })));
      topReferrers = ok(topMap(referrers));
      topCountries = ok(topMap(countries));
      topDevices = ok(topMap(devices, 6));
      topBrowsers = ok(topMap(browsers, 6));
    } catch (error) {
      const failed = fail<never>("page view aggregates", error, "Page view totals unavailable.");
      kpis = failed;
      series = failed;
      topPages = failed;
      topReferrers = failed;
      topCountries = failed;
      topDevices = failed;
      topBrowsers = failed;
    }
  }

  if (!clicksResult.ok && kpis.ok && kpis.data) {
    // page views loaded but clicks table failed: keep view KPIs, zero click fields with a reason on click widgets
  }

  let topPartners: DashboardWidget<CountRow[]>;
  let topPlacements: DashboardWidget<CountRow[]>;
  let topClickPaths: DashboardWidget<CountRow[]>;
  if (!clicksResult.ok) {
    const failed = fail<CountRow[]>("outbound clicks", clicksResult.error, "Outbound clicks unavailable.");
    topPartners = failed;
    topPlacements = failed;
    topClickPaths = failed;
    if (kpis.ok && kpis.data) {
      kpis = {
        ok: true,
        reason: null,
        data: {
          ...kpis.data,
          clicks: 0,
          clicksDelta: null,
          ctr: null,
          ctrDelta: null,
          earningClicks: 0,
          earningClicksDelta: null,
        },
      };
    }
  } else {
    try {
      const partners = new Map<string, number>();
      const placements = new Map<string, number>();
      const paths = new Map<string, number>();
      for (const row of currentClicks) {
        if (row.partner) partners.set(row.partner, (partners.get(row.partner) ?? 0) + 1);
        if (row.placement) placements.set(row.placement, (placements.get(row.placement) ?? 0) + 1);
        if (row.from_path) paths.set(row.from_path, (paths.get(row.from_path) ?? 0) + 1);
      }
      topPartners = ok(topMap(partners));
      topPlacements = ok(topMap(placements));
      topClickPaths = ok(
        topMap(paths).map((row) => ({
          ...row,
          href: row.label.startsWith("/") ? row.label : undefined,
        })),
      );
    } catch (error) {
      const failed = fail<CountRow[]>("click aggregates", error, "Outbound click totals unavailable.");
      topPartners = failed;
      topPlacements = failed;
      topClickPaths = failed;
    }
  }

  if (submissionsResult.ok === false && kpis.ok && kpis.data) {
    fail("submissions", submissionsResult.error, "Submissions unavailable.");
    kpis = {
      ...kpis,
      data: { ...kpis.data, submissions: 0, submissionsDelta: null },
    };
  }

  let vitals: DashboardWidget<VitalTile[]>;
  if (!vitalsResult.ok) {
    vitals = fail("web vitals", vitalsResult.error, "Web Vitals unavailable.");
  } else {
    try {
      const groups: Record<VitalTile["metric"], number[]> = { LCP: [], INP: [], CLS: [] };
      for (const row of vitalsResult.rows) {
        if (row.metric !== "LCP" && row.metric !== "INP" && row.metric !== "CLS") continue;
        if (typeof row.value !== "number" || !Number.isFinite(row.value)) continue;
        groups[row.metric].push(row.value);
      }
      vitals = ok(
        (["LCP", "INP", "CLS"] as const).map((metric) => {
          const p75 = percentile(groups[metric], 0.75);
          const t = VITAL_THRESHOLDS[metric];
          return {
            metric,
            p75,
            unit: t.unit,
            rating: vitalRating(metric, p75),
            samples: groups[metric].length,
            good: t.good,
            poor: t.poor,
          };
        }),
      );
    } catch (error) {
      vitals = fail("web vitals", error, "Web Vitals unavailable.");
    }
  }

  let activity: DashboardWidget<ActivityItem[]>;
  try {
    const items: ActivityItem[] = [];
    if (clicksResult.ok) {
      for (const row of clicksResult.rows.filter((row) => inCurrent(row.ts, period)).slice(0, 8)) {
        items.push({
          id: `click-${row.id}`,
          kind: "click",
          title: clickTitle(row),
          detail: [row.kind, row.placement || row.from_path].filter(Boolean).join(" · ") || "Outbound click",
          ts: row.ts,
        });
      }
    }
    if (submissionsResult.ok) {
      for (const row of currentSubs.slice(0, 8)) {
        items.push({
          id: `sub-${row.id}`,
          kind: "submission",
          title: submissionTitle(row),
          detail: [row.kind, row.city].filter(Boolean).join(" · ") || "Submission",
          ts: row.created_at,
        });
      }
    }
    items.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
    activity = ok(items.slice(0, 10));
  } catch (error) {
    activity = fail("activity", error, "Recent activity unavailable.");
  }

  // If clicks failed, still fill series clicks as zeros when views worked
  if (series.ok && series.data && !clicksResult.ok) {
    series = ok(series.data.map((point) => ({ ...point, clicks: 0 })));
  }

  return {
    report: {
      range,
      periodStart: period.start.toISOString(),
      periodEnd: period.end.toISOString(),
      previousStart: period.previousStart.toISOString(),
      kpis,
      series,
      topPages,
      topReferrers,
      topCountries,
      topDevices,
      topBrowsers,
      topPartners,
      topPlacements,
      topClickPaths,
      vitals,
      activity,
    },
    reason: "ok",
  };
}
