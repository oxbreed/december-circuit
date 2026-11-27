import "server-only";
import { partners, type GoQuery, type PartnerSlug } from "./affiliate-partners";

/**
 * Server-only partner destinations. Affiliate IDs come from env vars, with
 * in-code defaults for Trip.com, Viator, and Booking.com CJ (public deep-link
 * params). With no ID and no default, the redirect opens the partner's normal
 * public page and the click is logged as not earning — the site never claims a
 * commission it is not set up to receive.
 *
 * Env vars (all optional, names only in .env.example):
 * - TRIPCOM_ALLIANCE_ID + TRIPCOM_SID — override the Trip.com defaults below
 * - AGODA_CID — Agoda Partners site id
 * - BOOKING_CJ_PID + BOOKING_CJ_LINK_ID — override the Booking.com CJ defaults
 *   below. Set either var to empty to blank the default and fall back to
 *   BOOKING_AID if that is set.
 * - BOOKING_AID — Booking.com direct affiliate id (used only when CJ IDs are
 *   not present)
 * - VIATOR_PID + VIATOR_MCID — override the Viator defaults below
 */

/** Public Trip.com params for the Oxbreed Management Ltd site. Env vars override. */
const TRIPCOM_ALLIANCE_DEFAULT = "11268503";
const TRIPCOM_SID_DEFAULT = "335386234";

/** Public Viator Partner Program params. Env vars override. */
const VIATOR_PID_DEFAULT = "P00333160";
const VIATOR_MCID_DEFAULT = "66722";

/**
 * Public CJ deep-link params from the CJ dashboard (27 Nov 2026): website PID
 * 101934385 (Dirty December, Active) and text-link 11916287 ('Secret Deals',
 * dest http://www.booking.com/index.html) for advertiser 4347392 Booking.com
 * MEA, with deep linking enabled. Env vars override; an explicitly empty env
 * var blanks the default.
 */
const BOOKING_CJ_PID_DEFAULT = "101934385";
const BOOKING_CJ_LINK_ID_DEFAULT = "11916287";

function env(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

/**
 * Unset → fallback. Explicitly present but empty (or whitespace) → blanked
 * (null), so a default can be turned off in the server environment.
 */
function envOrDefault(name: string, fallback: string) {
  if (Object.prototype.hasOwnProperty.call(process.env, name)) {
    const value = process.env[name]?.trim() ?? "";
    return value ? value : null;
  }
  return fallback;
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

/** CJ PID / link IDs are digits only, so a bad env value cannot change the host. */
function cjNumericId(value: string | null) {
  if (!value) return null;
  return /^\d+$/.test(value) ? value : null;
}

/** CJ `sid` from /go/?from= — control chars stripped, then safe slug, max 64. */
function cjSid(value: string | null | undefined) {
  if (!value) return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!cleaned) return null;
  const sid = cleaned
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 64);
  return sid || null;
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

function bookingSearch(query: GoQuery) {
  const url = new URL("https://www.booking.com/searchresults.html");
  const text = searchText(query);
  if (text) url.searchParams.set("ss", text);
  return url;
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
    const dest = bookingSearch(query);
    const pid = cjNumericId(envOrDefault("BOOKING_CJ_PID", BOOKING_CJ_PID_DEFAULT));
    const linkId = cjNumericId(envOrDefault("BOOKING_CJ_LINK_ID", BOOKING_CJ_LINK_ID_DEFAULT));
    if (pid && linkId) {
      const click = new URL(`https://www.dpbolvw.net/click-${pid}-${linkId}`);
      click.searchParams.set("url", dest.toString());
      const sid = cjSid(query.placement);
      if (sid) click.searchParams.set("sid", sid);
      return { url: click, earning: true };
    }
    const aid = env("BOOKING_AID");
    if (aid) dest.searchParams.set("aid", aid);
    return { url: dest, earning: Boolean(aid) };
  },
  // No GetYourGuide partner ID yet: a plain, unsponsored city search.
  getyourguide: (query) => {
    const url = new URL("https://www.getyourguide.com/s/");
    const text = searchText({ city: query.city, country: query.country });
    if (text) url.searchParams.set("q", text);
    return { url, earning: false };
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
