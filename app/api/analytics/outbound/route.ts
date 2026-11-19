import { after, NextResponse } from "next/server";
import { eventBySlug } from "../../../event-view";
import { currentSponsors } from "../../../sponsors";
import { clip, countryFromHeaders, logOutboundClick } from "../../../outbound-clicks";

/**
 * Beacon for outbound clicks that keep their real href (ticket links and paid
 * sponsor links). The destination is looked up server-side from the record,
 * never taken from the request body.
 */

function noStore(status: number) {
  return new NextResponse(null, { status, headers: { "Cache-Control": "no-store" } });
}

function hostOf(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function normalizePath(value: unknown) {
  const path = clip(value, 512);
  if (!path || !path.startsWith("/")) return null;
  return path.split("?")[0] || null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStore(400);
  }
  if (!body || typeof body !== "object") return noStore(400);
  const record = body as Record<string, unknown>;
  const kind = record.kind;
  const target = clip(record.target, 160);
  if (!target) return noStore(400);

  let destinationHost: string | null = null;
  let partner = "";
  if (kind === "ticket") {
    const resolved = eventBySlug(target);
    destinationHost = hostOf(resolved?.event.ticketsUrl);
    partner = "ticket";
  } else if (kind === "sponsor") {
    const sponsor = currentSponsors().find((item) => item.slug === target);
    destinationHost = hostOf(sponsor?.url);
    partner = "sponsor";
  } else {
    return noStore(400);
  }
  if (!destinationHost) return noStore(204);

  const country = countryFromHeaders(request.headers);
  const placement = clip(record.placement, 64);
  const fromPath = normalizePath(record.path);

  after(() =>
    logOutboundClick({
      kind,
      partner,
      target,
      destinationHost,
      placement,
      fromPath,
      country,
      earning: false,
    }),
  );

  return noStore(204);
}

export async function GET() {
  return noStore(405);
}
