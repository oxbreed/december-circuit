import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  const headers = request.headers;
  const raw =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code") ??
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
  if (!path) return noStore(400);

  const country = countryFromHeaders(request);
  const referrer = clip(record.referrer, 512);
  const ua = clip(request.headers.get("user-agent"), 256);

  const { error } = await supabase.from("page_views").insert({
    path,
    country,
    referrer,
    ua,
  });

  if (error) {
    // Table missing or grant missing — stay quiet so the public site never breaks.
    return noStore(204);
  }

  // Best-effort 90-day retention sweep (ignore failures).
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  void supabase.from("page_views").delete().lt("ts", cutoff);

  return noStore(204);
}

export async function GET() {
  return noStore(405);
}
