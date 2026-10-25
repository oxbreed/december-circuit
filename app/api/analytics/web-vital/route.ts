import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);
const RATINGS = new Set(["good", "needs-improvement", "poor"]);

function present(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function serviceClient() {
  const url = present(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? present(process.env.SUPABASE_URL);
  const serviceKey = present(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function pageviewsDisabled() {
  const flag = present(process.env.SITE_PAGEVIEWS_ENABLED);
  if (!flag) return false;
  return ["0", "false", "off", "no"].includes(flag.toLowerCase());
}

function clip(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function normalizePath(value: unknown) {
  const path = clip(value, 512);
  if (!path || !path.startsWith("/")) return null;
  if (path.startsWith("/admin") || path.startsWith("/api/") || path.startsWith("/auth/")) {
    return null;
  }
  return path;
}

function countryFromHeaders(request: Request) {
  const raw =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code") ??
    null;
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || code === "XX" || code === "T1") return null;
  return code;
}

function noStore(status: number) {
  return new NextResponse(null, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (pageviewsDisabled()) return noStore(204);

  const supabase = serviceClient();
  if (!supabase) return noStore(204);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStore(400);
  }

  if (!body || typeof body !== "object") return noStore(400);
  const record = body as Record<string, unknown>;

  const path = normalizePath(record.path);
  const metric = clip(record.metric, 8)?.toUpperCase() ?? null;
  if (!path || !metric || !METRICS.has(metric)) return noStore(400);

  const value = typeof record.value === "number" ? record.value : Number(record.value);
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000) return noStore(400);

  const ratingRaw = clip(record.rating, 32)?.toLowerCase() ?? null;
  const rating = ratingRaw && RATINGS.has(ratingRaw) ? ratingRaw : null;

  const { error } = await supabase.from("web_vitals").insert({
    path,
    metric,
    value,
    rating,
    country: countryFromHeaders(request),
  });

  if (error) return noStore(204);

  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  void supabase.from("web_vitals").delete().lt("ts", cutoff);

  return noStore(204);
}

export async function GET() {
  return noStore(405);
}
