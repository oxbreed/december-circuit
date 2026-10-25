import "server-only";
import { directorySignIn } from "./directory-auth";
import { createServiceClient } from "./supabase/server";
import { getDirectoryUser } from "./supabase/session";

export type CountRow = { label: string; count: number };

export type DayCount = { day: string; count: number };

export type PageViewSummary = {
  total: number;
  last24h: number;
  last7d: number;
  last30d: number;
  uniquePaths: number;
  uniqueCountries: number;
  topPaths: CountRow[];
  topCountries: CountRow[];
  topReferrers: CountRow[];
  daily7: DayCount[];
  daily30: DayCount[];
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

function emptySummary(): PageViewSummary {
  return {
    total: 0,
    last24h: 0,
    last7d: 0,
    last30d: 0,
    uniquePaths: 0,
    uniqueCountries: 0,
    topPaths: [],
    topCountries: [],
    topReferrers: [],
    daily7: [],
    daily30: [],
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

export async function summarizePageViews(): Promise<{
  summary: PageViewSummary | null;
  reason: "ok" | "no-key" | "forbidden" | "error" | "empty";
}> {
  const gate = await requireAdminService();
  if (!gate.ok) return { summary: null, reason: gate.reason };

  const { data, error } = await gate.supabase
    .from("page_views")
    .select("path, country, referrer, ts")
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

  const pathCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  const dailyCounts = new Map<string, number>();
  const paths = new Set<string>();
  const countries = new Set<string>();
  let last24h = 0;
  let last7d = 0;
  let last30d = 0;

  for (const row of data) {
    if (typeof row.path === "string" && row.path) {
      pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
      paths.add(row.path.split("?")[0] || row.path);
    }
    if (typeof row.country === "string" && row.country) {
      countryCounts.set(row.country, (countryCounts.get(row.country) ?? 0) + 1);
      countries.add(row.country);
    }
    if (typeof row.referrer === "string" && row.referrer) {
      const host = hostFromReferrer(row.referrer);
      if (host && !host.includes("dirtydecember.info")) {
        referrerCounts.set(host, (referrerCounts.get(host) ?? 0) + 1);
      }
    }
    if (typeof row.ts === "string") {
      const ms = Date.parse(row.ts);
      if (!Number.isNaN(ms)) {
        if (ms >= day) last24h += 1;
        if (ms >= week) last7d += 1;
        if (ms >= month) last30d += 1;
        if (ms >= month) {
          const key = dayKey(ms);
          dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
        }
      }
    }
  }

  return {
    summary: {
      total: data.length,
      last24h,
      last7d,
      last30d,
      uniquePaths: paths.size,
      uniqueCountries: countries.size,
      topPaths: topEntries(pathCounts, 10),
      topCountries: topEntries(countryCounts, 10),
      topReferrers: topEntries(referrerCounts, 8),
      daily7: fillDaily(dailyCounts, 7, now),
      daily30: fillDaily(dailyCounts, 30, now),
      sampleSize: data.length,
    },
    reason: "ok",
  };
}
