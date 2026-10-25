import "server-only";
import { directorySignIn } from "./directory-auth";
import { createServiceClient } from "./supabase/server";
import { getDirectoryUser } from "./supabase/session";

export type CountRow = { label: string; count: number };

export type DayCount = { day: string; count: number };

export type RankedBundle = {
  paths: CountRow[];
  countries: CountRow[];
  sources: CountRow[];
};

export type PageViewSummary = {
  total: number;
  last24h: number;
  last7d: number;
  last30d: number;
  uniquePaths: number;
  uniqueCountries: number;
  sessions7: number;
  sessions30: number;
  pageviews7: DayCount[];
  pageviews30: DayCount[];
  sessionsDaily7: DayCount[];
  sessionsDaily30: DayCount[];
  tops7: RankedBundle;
  tops30: RankedBundle;
  sampleSize: number;
};

async function requireAdminService() {
  const auth = directorySignIn();
  if (!auth.connected || !auth.adminEmail) return { ok: false as const, reason: "no-key" as const };
  const user = await getDirectoryUser();
  if (!user || user.email !== auth.adminEmail) {
    return { ok: false as const, reason: "forbidden" as const };
  }
  const supabase = createServiceClient();
  if (!supabase) return { ok: false as const, reason: "no-key" as const };
  return { ok: true as const, supabase };
}

function emptyRanks(): RankedBundle {
  return { paths: [], countries: [], sources: [] };
}

function emptySummary(): PageViewSummary {
  return {
    total: 0,
    last24h: 0,
    last7d: 0,
    last30d: 0,
    uniquePaths: 0,
    uniqueCountries: 0,
    sessions7: 0,
    sessions30: 0,
    pageviews7: [],
    pageviews30: [],
    sessionsDaily7: [],
    sessionsDaily30: [],
    tops7: emptyRanks(),
    tops30: emptyRanks(),
    sampleSize: 0,
  };
}

function dayKey(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

function fillDaily(counts: Map<string, number>, days: number, now: number): DayCount[] {
  const out: DayCount[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = dayKey(now - i * 24 * 60 * 60 * 1000);
    out.push({ day: key, count: counts.get(key) ?? 0 });
  }
  return out;
}

function topEntries(map: Map<string, number>, limit: number): CountRow[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function hostFromReferrer(referrer: string) {
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, "") || referrer;
  } catch {
    return referrer.length > 64 ? `${referrer.slice(0, 64)}…` : referrer;
  }
}

function sessionKey(country: string | null, ua: string | null) {
  return `${country ?? "??"}|${(ua ?? "unknown").slice(0, 80)}`;
}

function buildRanks(
  rows: { path: string | null; country: string | null; referrer: string | null }[],
): RankedBundle {
  const pathCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  for (const row of rows) {
    if (row.path) pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
    if (row.country) countryCounts.set(row.country, (countryCounts.get(row.country) ?? 0) + 1);
    if (row.referrer) {
      const host = hostFromReferrer(row.referrer);
      if (host && !host.includes("dirtydecember.info")) {
        referrerCounts.set(host, (referrerCounts.get(host) ?? 0) + 1);
      }
    }
  }
  return {
    paths: topEntries(pathCounts, 8),
    countries: topEntries(countryCounts, 8),
    sources: topEntries(referrerCounts, 8),
  };
}

export async function summarizePageViews(): Promise<{
  summary: PageViewSummary | null;
  reason: "ok" | "no-key" | "forbidden" | "error" | "empty";
}> {
  const gate = await requireAdminService();
  if (!gate.ok) return { summary: null, reason: gate.reason };

  const { data, error } = await gate.supabase
    .from("page_views")
    .select("path, country, referrer, ua, ts")
    .order("ts", { ascending: false })
    .limit(8000);

  if (error) return { summary: null, reason: "error" };
  if (!data || data.length === 0) {
    return { summary: emptySummary(), reason: "empty" };
  }

  const now = Date.now();
  const day = now - 24 * 60 * 60 * 1000;
  const week = now - 7 * 24 * 60 * 60 * 1000;
  const month = now - 30 * 24 * 60 * 60 * 1000;

  const pageviewDaily = new Map<string, number>();
  const sessionSets = new Map<string, Set<string>>();
  const paths = new Set<string>();
  const countries = new Set<string>();
  const rows7: { path: string | null; country: string | null; referrer: string | null }[] = [];
  const rows30: { path: string | null; country: string | null; referrer: string | null }[] = [];
  let last24h = 0;
  let last7d = 0;
  let last30d = 0;

  for (const row of data) {
    const path = typeof row.path === "string" ? row.path : null;
    const country = typeof row.country === "string" ? row.country : null;
    const referrer = typeof row.referrer === "string" ? row.referrer : null;
    const ua = typeof row.ua === "string" ? row.ua : null;
    if (path) paths.add(path.split("?")[0] || path);
    if (country) countries.add(country);

    if (typeof row.ts !== "string") continue;
    const ms = Date.parse(row.ts);
    if (Number.isNaN(ms)) continue;

    if (ms >= day) last24h += 1;
    if (ms >= week) {
      last7d += 1;
      rows7.push({ path, country, referrer });
    }
    if (ms >= month) {
      last30d += 1;
      rows30.push({ path, country, referrer });
      const key = dayKey(ms);
      pageviewDaily.set(key, (pageviewDaily.get(key) ?? 0) + 1);
      let set = sessionSets.get(key);
      if (!set) {
        set = new Set();
        sessionSets.set(key, set);
      }
      set.add(sessionKey(country, ua));
    }
  }

  const sessionDaily = new Map<string, number>();
  for (const [key, set] of sessionSets) {
    sessionDaily.set(key, set.size);
  }

  const sessionsDaily7 = fillDaily(sessionDaily, 7, now);
  const sessionsDaily30 = fillDaily(sessionDaily, 30, now);

  return {
    summary: {
      total: data.length,
      last24h,
      last7d,
      last30d,
      uniquePaths: paths.size,
      uniqueCountries: countries.size,
      sessions7: sessionsDaily7.reduce((sum, row) => sum + row.count, 0),
      sessions30: sessionsDaily30.reduce((sum, row) => sum + row.count, 0),
      pageviews7: fillDaily(pageviewDaily, 7, now),
      pageviews30: fillDaily(pageviewDaily, 30, now),
      sessionsDaily7,
      sessionsDaily30,
      tops7: buildRanks(rows7),
      tops30: buildRanks(rows30),
      sampleSize: data.length,
    },
    reason: "ok",
  };
}
