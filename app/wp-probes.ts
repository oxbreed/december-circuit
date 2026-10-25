import "server-only";
import { directorySignIn } from "./directory-auth";
import { createServiceClient } from "./supabase/server";
import { getDirectoryUser } from "./supabase/session";

export type WpProbeRow = {
  id: string;
  path: string;
  method: string;
  ua: string | null;
  ip: string | null;
  xff: string | null;
  referer: string | null;
  host: string | null;
  ts: string;
};

export type WpProbeSettings = {
  logging_enabled: boolean;
  retention_days: number | null;
  updated_at: string | null;
};

export type WpProbeFilters = {
  path?: string;
  ip?: string;
  from?: string;
  to?: string;
};

export type WpProbeSummary = {
  total: number;
  last24h: number;
  distinctIps: number;
  topPaths: { path: string; count: number }[];
};

async function requireAdminService() {
  const auth = directorySignIn();
  if (!auth.connected || !auth.adminEmail) return { ok: false as const, reason: "no-key" as const };
  const user = await getDirectoryUser();
  if (!user || user.email !== auth.adminEmail) return { ok: false as const, reason: "forbidden" as const };
  const supabase = createServiceClient();
  if (!supabase) return { ok: false as const, reason: "no-key" as const };
  return { ok: true as const, supabase };
}

function textOrNull(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizePathFilter(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed.length > 200) return null;
  return trimmed;
}

function normalizeIpFilter(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed.length > 128) return null;
  return trimmed;
}

function normalizeDateFilter(value: string | undefined, endOfDay: boolean) {
  const trimmed = value?.trim() ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return endOfDay ? `${trimmed}T23:59:59.999Z` : `${trimmed}T00:00:00.000Z`;
}

function mapProbeRow(row: Record<string, unknown>): WpProbeRow | null {
  if (
    typeof row.id !== "string" ||
    typeof row.path !== "string" ||
    typeof row.method !== "string" ||
    typeof row.ts !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    path: row.path,
    method: row.method,
    ua: textOrNull(row.ua),
    ip: textOrNull(row.ip),
    xff: textOrNull(row.xff),
    referer: textOrNull(row.referer),
    host: textOrNull(row.host),
    ts: row.ts,
  };
}

export async function getWpProbeSettings(): Promise<{
  settings: WpProbeSettings | null;
  reason: "ok" | "no-key" | "forbidden" | "error";
}> {
  const gate = await requireAdminService();
  if (!gate.ok) return { settings: null, reason: gate.reason };
  const { data, error } = await gate.supabase
    .from("wp_probe_settings")
    .select("logging_enabled, retention_days, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (error) return { settings: null, reason: "error" };
  if (!data) {
    return {
      settings: { logging_enabled: true, retention_days: 30, updated_at: null },
      reason: "ok",
    };
  }
  return {
    settings: {
      logging_enabled: Boolean(data.logging_enabled),
      retention_days:
        typeof data.retention_days === "number" && Number.isFinite(data.retention_days)
          ? data.retention_days
          : null,
      updated_at: typeof data.updated_at === "string" ? data.updated_at : null,
    },
    reason: "ok",
  };
}

export async function listWpProbes(
  filters: WpProbeFilters,
  limit = 100,
): Promise<{ rows: WpProbeRow[]; reason: "ok" | "no-key" | "forbidden" | "error" }> {
  const gate = await requireAdminService();
  if (!gate.ok) return { rows: [], reason: gate.reason };

  let query = gate.supabase
    .from("wp_probes")
    .select("id, path, method, ua, ip, xff, referer, host, ts")
    .order("ts", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 500));

  const path = normalizePathFilter(filters.path);
  if (path) query = query.ilike("path", `%${path}%`);

  const ip = normalizeIpFilter(filters.ip);
  if (ip) query = query.eq("ip", ip);

  const from = normalizeDateFilter(filters.from, false);
  if (from) query = query.gte("ts", from);

  const to = normalizeDateFilter(filters.to, true);
  if (to) query = query.lte("ts", to);

  const { data, error } = await query;
  if (error || !data) return { rows: [], reason: "error" };
  return {
    rows: data.flatMap((row) => {
      const mapped = mapProbeRow(row as Record<string, unknown>);
      return mapped ? [mapped] : [];
    }),
    reason: "ok",
  };
}

export async function summarizeWpProbes(
  filters: WpProbeFilters,
): Promise<{ summary: WpProbeSummary | null; reason: "ok" | "no-key" | "forbidden" | "error" }> {
  const gate = await requireAdminService();
  if (!gate.ok) return { summary: null, reason: gate.reason };

  let query = gate.supabase.from("wp_probes").select("path, ip, ts");

  const path = normalizePathFilter(filters.path);
  if (path) query = query.ilike("path", `%${path}%`);
  const ip = normalizeIpFilter(filters.ip);
  if (ip) query = query.eq("ip", ip);
  const from = normalizeDateFilter(filters.from, false);
  if (from) query = query.gte("ts", from);
  const to = normalizeDateFilter(filters.to, true);
  if (to) query = query.lte("ts", to);

  const { data, error } = await query.limit(5000);
  if (error || !data) return { summary: null, reason: "error" };

  const since = Date.now() - 24 * 60 * 60 * 1000;
  const pathCounts = new Map<string, number>();
  const ips = new Set<string>();
  let last24h = 0;

  for (const row of data) {
    if (typeof row.path === "string") {
      pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
    }
    if (typeof row.ip === "string" && row.ip) ips.add(row.ip);
    if (typeof row.ts === "string" && Date.parse(row.ts) >= since) last24h += 1;
  }

  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([p, count]) => ({ path: p, count }));

  return {
    summary: {
      total: data.length,
      last24h,
      distinctIps: ips.size,
      topPaths,
    },
    reason: "ok",
  };
}

export async function exportWpProbesCsv(
  filters: WpProbeFilters,
): Promise<{ csv: string | null; reason: "ok" | "no-key" | "forbidden" | "error" }> {
  const listed = await listWpProbes(filters, 500);
  if (listed.reason !== "ok") return { csv: null, reason: listed.reason };

  const header = ["ts", "method", "path", "ip", "xff", "ua", "referer", "host"];
  const lines = [header.join(",")];
  for (const row of listed.rows) {
    lines.push(
      [
        row.ts,
        row.method,
        row.path,
        row.ip ?? "",
        row.xff ?? "",
        row.ua ?? "",
        row.referer ?? "",
        row.host ?? "",
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return { csv: `${lines.join("\n")}\n`, reason: "ok" };
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
