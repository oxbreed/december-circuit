import "server-only";
import { partners, type GoQuery, type PartnerSlug } from "./affiliate-partners";

/**
 * Server-only partner destinations. Affiliate IDs come from env vars, with
 * in-code defaults for Trip.com and Viator (public deep-link params). With no ID
 * and no default, the redirect opens the partner's normal public page and the
 * click is logged as not earning — the site never claims a commission it is
 * not set up to receive.
 *
 * Env vars (all optional, names only in .env.example):
 * - TRIPCOM_ALLIANCE_ID + TRIPCOM_SID — override the Trip.com defaults below
 * - AGODA_CID — Agoda Partners site id
 * - BOOKING_AID — Booking.com affiliate id
 * - VIATOR_PID + VIATOR_MCID — override the Viator defaults below
 */

/** Public Trip.com params for the Oxbreed Management Ltd site. Env vars override. */
const TRIPCOM_ALLIANCE_DEFAULT = "11268503";
const TRIPCOM_SID_DEFAULT = "335386234";

/** Public Viator Partner Program params. Env vars override. */
const VIATOR_PID_DEFAULT = "P00333160";
const VIATOR_MCID_DEFAULT = "66722";

function env(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function clip(value: string | null | undefined, max = 80) {
  if (!value) return null;
  const trimmed = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function searchText(query: GoQuery) {
  const name = clip(query.name);
  const city = clip(query.city);
  const country = clip(query.country);
  return [name, city, country].filter(Boolean).join(", ");
}

type Built = { url: URL; earning: boolean };

function tripCom(base: string, query: GoQuery, keyword: boolean): Built {
  const url = new URL(base);
  const text = searchText(query);
  if (keyword && text) url.searchParams.set("keyword", text);
  const alliance = env("TRIPCOM_ALLIANCE_ID") ?? TRIPCOM_ALLIANCE_DEFAULT;
  const sid = env("TRIPCOM_SID") ?? TRIPCOM_SID_DEFAULT;
  const earning = Boolean(alliance && sid);
  if (alliance && sid) {
    url.searchParams.set("Allianceid", alliance);
    url.searchParams.set("SID", sid);
  }
  return { url, earning };
}

const builders: Record<PartnerSlug, (query: GoQuery) => Built> = {
  "tripcom-hotels": (query) => tripCom("https://www.trip.com/hotels/list", query, true),
  "tripcom-flights": (query) => tripCom("https://www.trip.com/flights/", query, false),
  agoda: (query) => {
    const url = new URL("https://www.agoda.com/partners/partnersearch.aspx");
    const text = searchText(query);
    if (text) url.searchParams.set("textToSearch", text);
    const cid = env("AGODA_CID");
    if (cid) url.searchParams.set("cid", cid);
    return { url, earning: Boolean(cid) };
  },
  booking: (query) => {
    const url = new URL("https://www.booking.com/searchresults.html");
    const text = searchText(query);
    if (text) url.searchParams.set("ss", text);
    const aid = env("BOOKING_AID");
    if (aid) url.searchParams.set("aid", aid);
    return { url, earning: Boolean(aid) };
  },
  viator: (query) => {
    const url = new URL("https://www.viator.com/searchResults/all");
    const text = searchText({ city: query.city, country: query.country });
    if (text) url.searchParams.set("text", text);
    const pid = env("VIATOR_PID") ?? VIATOR_PID_DEFAULT;
    const mcid = env("VIATOR_MCID") ?? VIATOR_MCID_DEFAULT;
    const earning = Boolean(pid && mcid);
    if (pid && mcid) {
      url.searchParams.set("pid", pid);
      url.searchParams.set("mcid", mcid);
      url.searchParams.set("medium", "link");
    }
    return { url, earning };
  },
};

export function partnerDestination(slug: PartnerSlug, query: GoQuery): Built {
  return builders[slug](query);
}

/** True when the partner's affiliate IDs are set (or defaulted) in this deployment. */
export function partnerEarning(slug: PartnerSlug) {
  return builders[slug]({}).earning;
}

export function partnerName(slug: PartnerSlug) {
  return partners[slug].name;
}
