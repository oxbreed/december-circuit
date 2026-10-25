import "server-only";
import { directorySignIn } from "./directory-auth";
import { createServiceClient } from "./supabase/server";
import { getDirectoryUser } from "./supabase/session";

export type PageViewSummary = {
  total: number;
  last24h: number;
  last7d: number;
  topPaths: { path: string; count: number }[];
  topCountries: { country: string; count: number }[];
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

export async function summarizePageViews(): Promise<{
  summary: PageViewSummary | null;
  reason: "ok" | "no-key" | "forbidden" | "error" | "empty";
}> {
  const gate = await requireAdminService();
  if (!gate.ok) return { summary: null, reason: gate.reason };

  const { data, error } = await gate.supabase
    .from("page_views")
    .select("path, country, ts")
    .order("ts", { ascending: false })
    .limit(5000);

  if (error) return { summary: null, reason: "error" };
  if (!data || data.length === 0) {
    return {
      summary: { total: 0, last24h: 0, last7d: 0, topPaths: [], topCountries: [] },
      reason: "empty",
    };
  }

  const now = Date.now();
  const day = now - 24 * 60 * 60 * 1000;
  const week = now - 7 * 24 * 60 * 60 * 1000;
  const pathCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  let last24h = 0;
  let last7d = 0;

  for (const row of data) {
    if (typeof row.path === "string" && row.path) {
      pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
    }
    if (typeof row.country === "string" && row.country) {
      countryCounts.set(row.country, (countryCounts.get(row.country) ?? 0) + 1);
    }
    if (typeof row.ts === "string") {
      const ms = Date.parse(row.ts);
      if (!Number.isNaN(ms)) {
        if (ms >= day) last24h += 1;
        if (ms >= week) last7d += 1;
      }
    }
  }

  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, count]) => ({ path, count }));

  const topCountries = [...countryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([country, count]) => ({ country, count }));

  return {
    summary: {
      total: data.length,
      last24h,
      last7d,
      topPaths,
      topCountries,
    },
    reason: "ok",
  };
}
