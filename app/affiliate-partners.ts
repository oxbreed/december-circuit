/**
 * Partner registry shared by server and client code.
 *
 * Nothing here holds an affiliate ID. IDs live in server env vars and are only
 * read in `affiliate-config.ts` (server-only) when `/go/[partner]` builds the
 * redirect. Templates link to `/go/<slug>?…` via `goHref`, never to a raw
 * partner URL with an ID pasted in.
 */

export type PartnerKind = "stays" | "flights" | "experiences";

export type PartnerSlug =
  | "tripcom-hotels"
  | "agoda"
  | "booking"
  | "tripcom-flights"
  | "viator"
  | "getyourguide";

export type PartnerMeta = {
  slug: PartnerSlug;
  name: string;
  kind: PartnerKind;
  /** Short action text for a link, e.g. "Hotels on Trip.com". */
  label: string;
};

export const partners: Record<PartnerSlug, PartnerMeta> = {
  "tripcom-hotels": { slug: "tripcom-hotels", name: "Trip.com", kind: "stays", label: "Hotels on Trip.com" },
  agoda: { slug: "agoda", name: "Agoda", kind: "stays", label: "Hotels on Agoda" },
  booking: { slug: "booking", name: "Booking.com", kind: "stays", label: "Stays on Booking.com" },
  "tripcom-flights": {
    slug: "tripcom-flights",
    name: "Trip.com",
    kind: "flights",
    label: "Flights on Trip.com",
  },
  viator: { slug: "viator", name: "Viator", kind: "experiences", label: "Tours on Viator" },
  getyourguide: {
    slug: "getyourguide",
    name: "GetYourGuide",
    kind: "experiences",
    label: "Tours on GetYourGuide",
  },
};

export const stayPartnerSlugs: readonly PartnerSlug[] = ["tripcom-hotels", "agoda", "booking"];

export function isPartnerSlug(value: string): value is PartnerSlug {
  return Object.prototype.hasOwnProperty.call(partners, value);
}

export type GoQuery = {
  /** City to search, e.g. "Lagos". */
  city?: string;
  /** Country for the search text, e.g. "Nigeria". */
  country?: string;
  /** A listed stay name, for a hotel-specific search. */
  name?: string;
  /** Where on the site the link sits (logged with the click), e.g. "guide-stay". */
  placement?: string;
};

/** First-party redirect URL for a partner. Safe to call in client components. */
export function goHref(slug: PartnerSlug, query: GoQuery = {}) {
  const params = new URLSearchParams();
  if (query.city) params.set("city", query.city);
  if (query.country) params.set("country", query.country);
  if (query.name) params.set("name", query.name);
  if (query.placement) params.set("from", query.placement);
  const qs = params.toString();
  return qs ? `/go/${slug}?${qs}` : `/go/${slug}`;
}

/** Analytics event name for a click on a partner of this kind. */
export function clickEventFor(kind: PartnerKind) {
  return kind === "stays" ? "stay_click" : "outbound_go";
}

export const commissionLabel = "We may earn a commission";
