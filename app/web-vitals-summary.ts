import "server-only";
import { directorySignIn } from "./directory-auth";
import { createServiceClient } from "./supabase/server";
import { getDirectoryUser } from "./supabase/session";

export type VitalMetricName = "LCP" | "INP" | "CLS";

export type VitalMetricSummary = {
  metric: VitalMetricName;
  samples: number;
  p75: number | null;
  median: number | null;
  good: number;
  needsImprovement: number;
  poor: number;
  unit: "ms" | "score";
  thresholds: { good: number; poor: number };
};

export type WebVitalsSummary = {
  last7d: VitalMetricSummary[];
  last30d: VitalMetricSummary[];
  sampleSize: number;
};

const METRIC_META: Record<
  VitalMetricName,
  { unit: "ms" | "score"; good: number; poor: number }
> = {
  LCP: { unit: "ms", good: 2500, poor: 4000 },
  INP: { unit: "ms", good: 200, poor: 500 },
  CLS: { unit: "score", good: 0.1, poor: 0.25 },
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

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx] ?? null;
}

function summarizeMetric(
  metric: VitalMetricName,
  rows: { value: number; rating: string | null }[],
): VitalMetricSummary {
  const meta = METRIC_META[metric];
  const values = rows.map((r) => r.value).sort((a, b) => a - b);
  let good = 0;
  let needsImprovement = 0;
  let poor = 0;
  for (const row of rows) {
    if (row.rating === "good") good += 1;
    else if (row.rating === "needs-improvement") needsImprovement += 1;
    else if (row.rating === "poor") poor += 1;
    else if (row.value <= meta.good) good += 1;
    else if (row.value <= meta.poor) needsImprovement += 1;
    else poor += 1;
  }
  return {
    metric,
    samples: rows.length,
    p75: percentile(values, 75),
    median: percentile(values, 50),
    good,
    needsImprovement,
    poor,
    unit: meta.unit,
    thresholds: { good: meta.good, poor: meta.poor },
  };
}

function emptyBucket(): VitalMetricSummary[] {
  return (["LCP", "INP", "CLS"] as VitalMetricName[]).map((metric) =>
    summarizeMetric(metric, []),
  );
}

export async function summarizeWebVitals(): Promise<{
  summary: WebVitalsSummary | null;
  reason: "ok" | "no-key" | "forbidden" | "error" | "empty";
}> {
  const gate = await requireAdminService();
  if (!gate.ok) return { summary: null, reason: gate.reason };

  const { data, error } = await gate.supabase
    .from("web_vitals")
    .select("metric, value, rating, ts")
    .in("metric", ["LCP", "INP", "CLS"])
    .order("ts", { ascending: false })
    .limit(8000);

  if (error) return { summary: null, reason: "error" };
  if (!data || data.length === 0) {
    return {
      summary: { last7d: emptyBucket(), last30d: emptyBucket(), sampleSize: 0 },
      reason: "empty",
    };
  }

  const now = Date.now();
  const week = now - 7 * 24 * 60 * 60 * 1000;
  const month = now - 30 * 24 * 60 * 60 * 1000;

  const buckets7: Record<VitalMetricName, { value: number; rating: string | null }[]> = {
    LCP: [],
    INP: [],
    CLS: [],
  };
  const buckets30: Record<VitalMetricName, { value: number; rating: string | null }[]> = {
    LCP: [],
    INP: [],
    CLS: [],
  };

  for (const row of data) {
    const metricName = row.metric;
    if (metricName !== "LCP" && metricName !== "INP" && metricName !== "CLS") continue;
    const metric: VitalMetricName = metricName;
    if (typeof row.value !== "number" || !Number.isFinite(row.value)) continue;
    const ms = typeof row.ts === "string" ? Date.parse(row.ts) : NaN;
    if (Number.isNaN(ms)) continue;
    const entry = {
      value: row.value,
      rating: typeof row.rating === "string" ? row.rating : null,
    };
    if (ms >= month) buckets30[metric].push(entry);
    if (ms >= week) buckets7[metric].push(entry);
  }

  return {
    summary: {
      last7d: (["LCP", "INP", "CLS"] as VitalMetricName[]).map((m) =>
        summarizeMetric(m, buckets7[m]),
      ),
      last30d: (["LCP", "INP", "CLS"] as VitalMetricName[]).map((m) =>
        summarizeMetric(m, buckets30[m]),
      ),
      sampleSize: data.length,
    },
    reason: "ok",
  };
}
