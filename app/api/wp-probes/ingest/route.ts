import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function present(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function ingestSecret() {
  return present(process.env.WP_PROBE_INGEST_SECRET);
}

function serviceClient() {
  const url = present(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? present(process.env.SUPABASE_URL);
  const serviceKey = present(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function authorized(request: Request) {
  const expected = ingestSecret();
  if (!expected) return false;
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ") && header.slice(7) === expected) return true;
  const alt = request.headers.get("x-wp-probe-secret");
  return alt === expected;
}

function clip(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return new NextResponse(null, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const supabase = serviceClient();
  if (!supabase) {
    return new NextResponse(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  if (!body || typeof body !== "object") {
    return new NextResponse(null, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const record = body as Record<string, unknown>;
  const path = clip(record.path, 2048);
  const method = clip(record.method, 16)?.toUpperCase() ?? "GET";
  if (!path) {
    return new NextResponse(null, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const { data: settings } = await supabase
    .from("wp_probe_settings")
    .select("logging_enabled, retention_days")
    .eq("id", 1)
    .maybeSingle();

  if (settings && settings.logging_enabled === false) {
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  const ts =
    typeof record.ts === "string" && !Number.isNaN(Date.parse(record.ts))
      ? new Date(record.ts).toISOString()
      : new Date().toISOString();

  const { error } = await supabase.from("wp_probes").insert({
    path,
    method,
    ua: clip(record.ua, 2048),
    ip: clip(record.ip, 128),
    xff: clip(record.xff, 1024),
    referer: clip(record.referer, 2048),
    host: clip(record.host, 512),
    ts,
  });

  if (error) {
    return new NextResponse(null, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  const retentionDays =
    typeof settings?.retention_days === "number" && Number.isFinite(settings.retention_days)
      ? settings.retention_days
      : null;
  if (retentionDays !== null) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    // Best-effort retention sweep; ignore failures so the probe response path stays quiet.
    void supabase.from("wp_probes").delete().lt("ts", cutoff);
  }

  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
