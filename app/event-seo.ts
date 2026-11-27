import { datesOnFile } from "./event-dates";
import { eventDateShort, fitDescription, fitTitleFrom } from "./seo";
import { presentEvent } from "./event-view";
import type { CircuitEvent } from "./events";

/**
 * Event facts for search: titles, descriptions and the pieces of Event JSON-LD
 * that the sourced summary states. Nothing here is guessed. A field is emitted
 * only when the event's own summary, source host or ticket link states it.
 */

/** Performers named in each sourced summary, keyed by sourceId then name. */
const performersBySource: Record<string, string[]> = {
  "oriade-residency": ["Davido"],
  "detty-december-fest": [
    "Wizkid",
    "Lauryn Hill",
    "DJ Tunez",
    "Summer Walker",
    "Young Thug",
  ],
  "iconiq-fest": ["BNXN", "Fola", "Oxlade", "Ruger", "Mr P"],
  "flytime-house-rb-essence": ["Brandy"],
  "rhythm-unplugged-stylerave": ["Lil Baby", "Kehlani"],
  "afrojazz-fest": ["Lagbaja", "The Cavemen"],
  "adekunle-gold-showman-jetron": ["Adekunle Gold"],
  "afrofuture-residency": [
    "Jazzwrld",
    "Thukuthela",
    "Rcee",
    "Victony",
    "Young Jonn",
  ],
  "zaama-disco-dailypost": ["Black Sherif"],
  "bhim-festival": ["Stonebwoy"],
  "victony-bonfire-abuja": ["Victony"],
  "victony-bonfire-lagos": ["Victony"],
  "johnny-room-live-8": ["Johnny Drille"],
  "lol-music-fest": ["Wizkid"],
  "apitainment-seyi-apitix": ["Seyi Vibez"],
  "cavy-fest-woya": ["The Cavemen"],
  "mother-africa-festival-tikerama": ["Quavo"],
};

/** Per-name performers where one source covers several different rows. */
const performersByName: { match: RegExp; performers: string[] }[] = [
  { match: /^ICONIQ FEST Abuja/i, performers: ["Fola"] },
  { match: /^Future Fest/i, performers: ["Olamide", "Asake"] },
  { match: /^Flytime Fest/i, performers: ["Latto", "Sexyy Red"] },
  { match: /^Mr P Live/i, performers: ["Mr P"] },
  { match: /^Moelogo/i, performers: ["Moelogo"] },
];

/** Organiser names stated on the sourced page or in the summary. */
const organiserByHost: Record<string, string> = {
  "dettydecfest.com": "Detty December Fest",
  "dmwhq.com": "Davido Music Worldwide",
  "iconiqfest.com": "ICONIQ FEST",
  "afrofuture.com": "AfroFuture",
  "afrojazzfest.org": "AfroJazz Fest",
  "bhimfestival.com": "BHIM Festival",
  "lolmusicfest.com": "Live Out Loud Music Festival",
  "abetour.com": "All Black Everything",
  "carnival.crossriverstate.gov.ng": "Carnival Calabar",
  "mainlandblockparty.com": "Mainland Block Party",
};

const ticketHosts =
  /(^|\.)(tix\.africa|tix\.to|apitix\.com|tix\.dot360\.co|jetronticket\.com|tikerama\.com|woya\.me)$/;

const offset: Record<string, string> = {
  Lagos: "+01:00",
  Abuja: "+01:00",
  Calabar: "+01:00",
  Accra: "+00:00",
  Abidjan: "+00:00",
};

function hostOf(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export function performersFor(event: CircuitEvent) {
  const name = presentEvent(event).name;
  const byName = performersByName.find((row) => row.match.test(name));
  if (byName) return byName.performers;
  if (event.sourceId && event.sourceId !== "carnival-calabar") {
    return performersBySource[event.sourceId] ?? [];
  }
  return [];
}

/** Organiser for Event JSON-LD, or null when the source does not name one. */
export function organizerFor(event: CircuitEvent) {
  if (!event.url) return null;
  const host = hostOf(event.url);
  if (!host) return null;
  if (event.sourceId === "mother-africa-festival-tikerama") {
    return { name: "KT7 Production", url: event.url };
  }
  const named = organiserByHost[host];
  if (named) return { name: named, url: event.url };
  const label = event.urlLabel;
  if (label === "Organiser's page" || label === "Official page") {
    return { name: host, url: event.url };
  }
  return null;
}

/** First clock time the sourced summary states, as "HH:MM". */
export function startTimeOf(event: CircuitEvent) {
  const match = event.summary.match(
    /\b(?:starts? at|from|gates at|at)\s+(\d{1,2})(?::(\d{2}))?\s?(am|pm)\b/i,
  );
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2] ?? "00";
  const pm = match[3].toLowerCase() === "pm";
  if (hour === 12) hour = pm ? 12 : 0;
  else if (pm) hour += 12;
  if (hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export function startDateWithTime(event: CircuitEvent) {
  const dates = datesOnFile(event.when);
  const zone = offset[event.region];
  const time = startTimeOf(event);
  if (!time || !zone || !/^\d{4}-\d{2}-\d{2}$/.test(dates.startDate)) {
    return { startDate: dates.startDate, endDate: dates.endDate };
  }
  const single = !dates.endDate || dates.endDate === dates.startDate;
  return {
    startDate: `${dates.startDate}T${time}:00${zone}`,
    endDate: single ? undefined : dates.endDate,
  };
}

export function offersFor(event: CircuitEvent) {
  const buy =
    event.ticketsUrl ??
    (hostOf(event.url) && ticketHosts.test(hostOf(event.url)!) ? event.url : undefined);
  if (!buy) return null;
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: buy,
  };
  // Only price the summary states outright: Mother Africa "from 20,000 F CFA".
  const cfa = event.summary.match(/from\s+([\d,]+)\s*F CFA/i);
  if (cfa) {
    offer["@type"] = "AggregateOffer";
    offer.lowPrice = Number(cfa[1].replace(/,/g, ""));
    offer.priceCurrency = "XOF";
  }
  return offer;
}

export function eventSeoTitle(event: CircuitEvent) {
  const view = presentEvent(event);
  const date = eventDateShort(event.when);
  const name = view.name;
  return fitTitleFrom([
    `${name}, ${view.region} ${date}: Tickets & Details`,
    `${name}, ${view.region} ${date} | Tickets`,
    `${name}, ${view.region} ${date}`,
    `${name} ${view.region} ${date.slice(-4)}: Date & Tickets`,
  ]);
}

export function eventSeoDescription(event: CircuitEvent) {
  const view = presentEvent(event);
  const date = eventDateShort(event.when);
  const venue = view.venue ? ` at ${view.venue}` : "";
  const note = view.note ? ` ${view.note}` : "";
  const lead = `${view.name}: ${date} in ${view.region}${venue}.${note}`;
  return fitDescription(lead, [
    "Check the date, venue and official link before you go.",
    "Part of the Detty December 2026 calendar.",
    "Dates, venues and official links on Dirty December.",
  ]);
}
