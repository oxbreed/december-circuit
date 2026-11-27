import { after, NextResponse, type NextRequest } from "next/server";
import { partnerDestination } from "../../affiliate-config";
import { isPartnerSlug } from "../../affiliate-partners";
import {
  clip,
  countryFromHeaders,
  logOutboundClick,
  referrerHost,
  sameSitePath,
} from "../../outbound-clicks";

/**
 * First-party affiliate redirect: /go/<partner>?city=&country=&name=&from=
 * 302s to the partner's search page. Affiliate IDs are added server-side from
 * env vars only. The destination host is fixed per partner (no open redirect).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partner: string }> },
) {
  const { partner } = await params;
  if (!isPartnerSlug(partner)) {
    return new NextResponse("Unknown partner link.", {
      status: 404,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  const search = request.nextUrl.searchParams;
  const placement = clip(search.get("from"), 64);
  const query = {
    city: clip(search.get("city"), 80) ?? undefined,
    country: clip(search.get("country"), 80) ?? undefined,
    name: clip(search.get("name"), 120) ?? undefined,
    placement: placement ?? undefined,
  };
  const { url, earning } = partnerDestination(partner, query);

  const referrer = request.headers.get("referer");
  const fromPath = sameSitePath(referrer, request.url);
  const extRef = referrerHost(referrer, request.url);
  const country = countryFromHeaders(request.headers);
  const target = [query.name, query.city, query.country].filter(Boolean).join(", ") || null;

  after(() =>
    logOutboundClick({
      kind: "partner",
      partner,
      target,
      destinationHost: url.host,
      placement,
      fromPath,
      referrerHost: extRef,
      country,
      earning,
    }),
  );

  const response = NextResponse.redirect(url, 302);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}
