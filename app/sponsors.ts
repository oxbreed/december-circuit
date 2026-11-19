/**
 * Paid placements (featured listings). Empty until an organiser or business
 * has agreed and paid for a placement. Every entry renders with a visible
 * "Paid placement" label and rel="sponsored". Do not add an entry without an
 * agreement — see /get-featured and /disclosure.
 */
export type SponsorPlacement = {
  /** Stable id used in click logs, e.g. "abe-lagos-2026". */
  slug?: string;
  name: string;
  url?: string;
  /** One line shown under the name. Use the sponsor's own approved wording. */
  blurb?: string;
  /** Event slug (from /events/<slug>) to badge as Featured on cards and the event page. */
  eventSlug?: string;
};

export const sponsors: SponsorPlacement[] = [];

/**
 * Sponsors to render. Remove an entry when its paid period ends (no automatic
 * date expiry: reading the clock during prerender breaks cacheComponents).
 */
export function currentSponsors(list: SponsorPlacement[] = sponsors) {
  return list.filter((item) => item.name.trim().length > 0);
}

export function isFeaturedEvent(slug: string) {
  return currentSponsors().some((item) => item.eventSlug === slug);
}
