import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * First-party outbound click log (migration 20261119120000_outbound_clicks.sql).
 * Service role only. Fails quietly when Supabase, the key, or the table is
 * missing so a redirect or a ticket click never breaks.
 */

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

function clicksDisabled() {
  const flag = present(process.env.SITE_PAGEVIEWS_ENABLED);
  if (!flag) return false;
  return ["0", "false", "off", "no"].includes(flag.toLowerCase());
}

export function clip(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function countryFromHeaders(headers: Headers) {
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

/** Path only (no query, no host) of a same-site referrer, else null. */
export function sameSitePath(referrer: string | null, requestUrl: string) {
  if (!referrer) return null;
  try {
    const ref = new URL(referrer);
    const own = new URL(requestUrl);
    if (ref.host !== own.host) return null;
    return clip(ref.pathname, 512);
  } catch {
    return null;
  }
}

/** Host only of an external referrer, else null. */
export function referrerHost(referrer: string | null, requestUrl: string) {
  if (!referrer) return null;
  try {
    const ref = new URL(referrer);
    const own = new URL(requestUrl);
    if (ref.host === own.host) return null;
    return clip(ref.host, 255);
  } catch {
    return null;
  }
}

export type OutboundClick = {
  kind: "partner" | "ticket" | "sponsor";
  partner: string;
  target?: string | null;
  destinationHost: string;
  placement?: string | null;
  fromPath?: string | null;
  referrerHost?: string | null;
  country?: string | null;
  earning: boolean;
};

export async function logOutboundClick(click: OutboundClick) {
  if (clicksDisabled()) return;
  const supabase = serviceClient();
  if (!supabase) return;
  try {
    await supabase.from("outbound_clicks").insert({
      kind: click.kind,
      partner: clip(click.partner, 64) ?? "unknown",
      target: clip(click.target, 160),
      destination_host: clip(click.destinationHost, 255) ?? "unknown",
      placement: clip(click.placement, 64),
      from_path: clip(click.fromPath, 512),
      referrer_host: clip(click.referrerHost, 255),
      country: click.country ?? null,
      earning: click.earning,
    });
  } catch {
    // Table or grant missing — stay quiet so the public site never breaks.
  }
}

export type OutboundClickRow = {
  id: string;
  kind: string;
  partner: string;
  target: string | null;
  destination_host: string;
  placement: string | null;
  from_path: string | null;
  referrer_host: string | null;
  country: string | null;
  earning: boolean;
  ts: string;
};

/**
 * Recent outbound clicks for the admin console. Service role only.
 * Reports no-key when the server key is missing, and error when the table
 * has not been applied or the query fails.
 */
export async function listOutboundClicks(limit = 80): Promise<{
  reason: "ok" | "no-key" | "error";
  rows: OutboundClickRow[];
}> {
  const supabase = serviceClient();
  if (!supabase) return { reason: "no-key", rows: [] };
  const { data, error } = await supabase
    .from("outbound_clicks")
    .select(
      "id, kind, partner, target, destination_host, placement, from_path, referrer_host, country, earning, ts",
    )
    .order("ts", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Admin outbound clicks query", error.message ?? error);
    return { reason: "error", rows: [] };
  }
  return { reason: "ok", rows: (data ?? []) as OutboundClickRow[] };
}
