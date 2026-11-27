/**
 * Search snippet helpers. Every page title is fitted to 50–60 characters and
 * every meta description to 140–160, so Google shows the whole snippet.
 * Fitting only trims or pads with fixed site wording; it never adds facts.
 */

import { eventDateSpan } from "./event-dates";

export const TITLE_MIN = 50;
export const TITLE_MAX = 60;
export const DESC_MIN = 140;
export const DESC_MAX = 160;

/** Fixed brand tails, tried in order until the title lands in range. */
const titleTails = [
  " | Dirty December",
  " · Detty December 2026",
  " | Detty December Guide",
  " · dirtydecember.info",
  " | Dirty December Guide 2026",
  " | Detty December 2026 Guide",
];

const descFillers = [
  "Dates, venues and official links on Dirty December.",
  "Sourced listings for Detty December 2026.",
  "Part of the Detty December 2026 guide.",
  "Outbound links only.",
];

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function cutAtWord(value: string, max: number) {
  if (value.length <= max) return value;
  const slice = value.slice(0, max + 1);
  const space = slice.lastIndexOf(" ");
  const cut = space > max * 0.6 ? slice.slice(0, space) : slice.slice(0, max);
  return cut.replace(/[\s,;:·|—–-]+$/, "");
}

export function fitTitle(input: string, tails: string[] = titleTails) {
  const base = clean(input);
  const inRange = (value: string) =>
    value.length >= TITLE_MIN && value.length <= TITLE_MAX;
  if (inRange(base)) return base;
  if (base.length < TITLE_MIN) {
    for (const tail of tails) {
      if (inRange(base + tail)) return base + tail;
    }
    // Two tails as a last resort for very short names.
    return cutAtWord(base + tails[0] + " · dirtydecember.info", TITLE_MAX);
  }
  // Too long: drop to the longest prefix that still ends cleanly.
  return cutAtWord(base, TITLE_MAX);
}

export function fitDescription(input: string, fillers: string[] = descFillers) {
  let text = clean(input);
  if (text.length > DESC_MAX) {
    const window = text.slice(0, DESC_MAX);
    const sentence = Math.max(window.lastIndexOf(". "), window.lastIndexOf("? "));
    if (sentence >= DESC_MIN - 20) {
      text = window.slice(0, sentence + 1);
    } else {
      text = cutAtWord(text, DESC_MAX - 1).replace(/[.,;:]+$/, "") + "…";
    }
  }
  for (const filler of fillers) {
    if (text.length >= DESC_MIN) break;
    const next = `${text} ${filler}`;
    if (next.length <= DESC_MAX) text = next;
  }
  return text;
}

/**
 * Hand-written snippets for fixed pages, keyed by path. Keyword-led, with the
 * disclaimers kept in the page body and the footer instead of the snippet.
 */
export const staticSeo: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Detty December 2026 Events: Lagos, Accra, Abuja & Abidjan",
    description:
      "Plan Detty December 2026 with confirmed concerts and festivals in Lagos, Accra, Abuja and Abidjan, plus a map, visa notes and a city-by-city guide.",
  },
  "/events": {
    title: "Detty December 2026 Events: Concerts, Festivals & Parties",
    description:
      "Every confirmed Detty December 2026 event on file, by date and city: concerts, festivals and parties in Lagos, Abuja, Accra, Calabar and Abidjan.",
  },
  "/detty-december": {
    title: "Detty December 2026: Events, Dates, Cities & Travel Guide",
    description:
      "Your Detty December 2026 hub: confirmed events in Lagos, Accra, Abuja and Calabar, city guides, visa notes, the map and where to stay, in one place.",
  },
  "/west-africa": {
    title: "West Africa Travel Guide: Cities, Hotels, Clubs & Events",
    description:
      "Plan a West Africa trip with city guides, hotels, restaurants, clubs and landmarks across Nigeria, Ghana and Côte d’Ivoire, plus Detty December events.",
  },
  "/cities": {
    title: "West Africa City Guides: Lagos, Accra, Abuja, Abidjan & More",
    description:
      "City guides for Lagos, Accra, Abuja, Abidjan, Calabar and more: what is on in December, where to stay and the places worth knowing before you travel.",
  },
  "/places": {
    title: "Hotels, Restaurants & Clubs in Lagos, Accra & West Africa",
    description:
      "Browse hotels, restaurants, clubs, beaches and landmarks in Lagos, Accra, Abuja, Abidjan and other West African cities, filtered by country and category.",
  },
  "/map": {
    title: "Detty December Map: Lagos, Abuja, Accra & Abidjan Venues",
    description:
      "Interactive Detty December 2026 map of hotels, venues and party spots in Lagos, Abuja, Accra and Abidjan, with event dates colour-coded by day.",
  },
  "/flights": {
    title: "Flights to Lagos, Accra & Abuja for Detty December 2026",
    description:
      "Search flights to Lagos, Accra, Abuja and Calabar for Detty December 2026, with airport notes and ride-app links for getting around once you land.",
  },
  "/explore": {
    title: "Explore Lagos, Accra & Calabar: Hotels, Food, Clubs & More",
    description:
      "Search hotels, restaurants, short stays, clubs, shopping and landmarks around Lagos, Accra and Calabar on the map, with third-party venue data.",
  },
  "/guides": {
    title: "Detty December 2026 Guides: Lagos, Accra, Calabar & Visas",
    description:
      "Season guides for Detty December 2026: Lagos things to do, Accra and Ghana, Carnival Calabar, where to stay, ticket safety and visa pages for US, UK and Canada.",
  },
  "/guide": {
    title: "Detty December Tourist Guide: Visa, Arrival & Getting Around",
    description:
      "A Detty December tourist guide for Lagos, Accra and Calabar: visa and entry notes, arriving, where to stay, getting around and what is on in December.",
  },
  "/news": {
    title: "Detty December News: Lagos, Accra & West Africa Updates",
    description:
      "Detty December and West Africa headlines from public news feeds, with the latest on concerts, festivals, travel and entertainment for the 2026 season.",
  },
  "/faq": {
    title: "Detty December FAQ: Visas, Tickets, Flights & Safety Tips",
    description:
      "Plain answers for diaspora visitors planning Detty December: events in Lagos, Accra and Calabar, visas, flights, maps, tickets and how bookings work.",
  },
  "/about": {
    title: "About Dirty December: An Independent Detty December Guide",
    description:
      "Dirty December is an independent Detty December and West Africa guide by Oxbreed Management. See what we list, how we source it and how bookings work.",
  },
  "/visa": {
    title: "Nigeria & Ghana Visa Guide for Detty December Travellers",
    description:
      "Visa and entry notes for Detty December trips to Lagos, Calabar and Accra, linking the Nigeria and Ghana immigration pages, with US, UK and Canada pages.",
  },
  "/search": {
    title: "Search Detty December Events, Places & Season Guides",
    description:
      "Search confirmed Detty December 2026 events, hotels, restaurants, clubs and season guides across Lagos, Accra, Abuja, Abidjan and Calabar in one place.",
  },
  "/list": {
    title: "List Your Event or Venue on Dirty December | Detty December",
    description:
      "Submit your Detty December event, venue or business to Dirty December for a free check, or ask about a clearly labelled paid placement for the season.",
  },
  "/get-featured": {
    title: "Get Your Event Featured for Detty December 2026 | Advertise",
    description:
      "Feature your event, venue or business for Detty December 2026 with labelled featured slots, sponsored stories and tracked ticket links. Ask for a quote.",
  },
  "/privacy": {
    title: "Privacy Policy: How Dirty December Handles Your Data",
    description:
      "How Dirty December handles your data: what we collect, how cookies and analytics consent work, and how to contact us about your information.",
  },
  "/terms": {
    title: "Terms of Use for Dirty December, the Detty December Guide",
    description:
      "The terms of use for Dirty December, an independent Detty December guide: what the site does, outbound bookings, submissions, ratings and its limits.",
  },
  "/eula": {
    title: "End User Licence Agreement | Dirty December Detty Guide",
    description:
      "Read the end user licence agreement for Dirty December, the independent Detty December guide, including the terms that apply when you use the site.",
  },
  "/cookies": {
    title: "Cookie Policy: Cookies on Dirty December | Detty December",
    description:
      "How Dirty December uses cookies and similar storage, which are optional, how analytics consent works and how to change your choice at any time.",
  },
  "/disclosure": {
    title: "Affiliate Disclosure: How Dirty December Earns | Detty Guide",
    description:
      "How Dirty December earns from some outbound links and how partner links are labelled, so you can see what is a partner link before you click.",
  },
  "/detty-december/calendar": {
    title: "Detty December 2026 Calendar: Every Event by Date & City",
    description:
      "Every confirmed Detty December 2026 event by date and city, from late November to early January, with links to each event page and its ticket source.",
  },
  "/guides/things-to-do-in-lagos-in-december-2026": {
    title: "Things to Do in Lagos in December 2026: Events, Food & Stays",
    description:
      "Things to do in Lagos in December 2026: concerts and festivals by date, restaurants, clubs, beaches, landmarks and hotels, each linked to its organiser page.",
  },
  "/guides/detty-december-ticket-safety-2026": {
    title: "Detty December 2026 Ticket Safety: Find the Real Ticket Page",
    description:
      "How to find the real ticket page for Detty December 2026 events: five checks before you pay, plus the organiser or ticket link on file for each event.",
  },
  "/guides/accra-ghana-2026": {
    title: "Accra December 2026: Events, Concerts & Things to Do Guide",
    description:
      "Accra and Ghana in December 2026: events by date including the AfroFuture residency at Future Club, flights in, where to stay and the official season dates.",
  },
  "/events/flytime-fest-2026": {
    title: "Flytime Fest 2026 Lagos Lineup: Latto, Sexyy Red & More",
    description:
      "Flytime Fest 2026 in Lagos at the Eko Convention Centre, 22 to 24 December: the lineup named so far, House of R&B and Circle, with a dated changelog.",
  },
  "/feedback": {
    title: "Send Feedback or Report a Correction | Dirty December",
    description:
      "Tell Dirty December about a wrong date, venue or link, or send feedback on the Detty December 2026 guide. We check every report against its source.",
  },
  "/sign-in": {
    title: "Sign In to Save Trips and Ratings | Dirty December Guide",
    description:
      "Sign in to Dirty December to save your Detty December trip, keep a list of events and places, and add ratings. Sign-in is optional for browsing.",
  },
};

/** First base title that already fits; otherwise the first base fitted with a tail. */
export function fitTitleFrom(bases: string[]) {
  const ok = (value: string) =>
    value.length >= TITLE_MIN && value.length <= TITLE_MAX;
  for (const base of bases) {
    const text = clean(base);
    if (ok(text)) return text;
  }
  for (const base of bases) {
    const text = clean(base);
    if (text.length < TITLE_MIN) {
      for (const tail of titleTails) {
        if (ok(text + tail)) return text + tail;
      }
    }
  }
  return fitTitle(bases[0]);
}

const monthShort = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function dayMonth(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return { day: d, month: monthShort[m - 1] };
}

/** "21 Dec 2026", "17–19 Dec 2026" or "1 Dec 2026–3 Jan 2027" from a sourced `when`. */
export function eventDateShort(when: string) {
  const span = eventDateSpan(when);
  if (!span) return when;
  const a = dayMonth(span.start);
  const b = dayMonth(span.end);
  const ya = span.start.slice(0, 4);
  const yb = span.end.slice(0, 4);
  if (span.start === span.end) return `${a.day} ${a.month} ${ya}`;
  if (ya !== yb) return `${a.day} ${a.month} ${ya}–${b.day} ${b.month} ${yb}`;
  if (a.month === b.month) return `${a.day}–${b.day} ${a.month} ${ya}`;
  return `${a.day} ${a.month}–${b.day} ${b.month} ${ya}`;
}

const singular: Record<string, string> = {
  Hotels: "Hotel",
  Restaurants: "Restaurant",
  Clubs: "Club",
  Bars: "Bar",
  Beaches: "Beach",
  Cinemas: "Cinema",
  Landmarks: "Landmark",
  "Beach resorts": "Beach resort",
  "Short-stay": "Short stay",
  "Practical stops": "Place to know",
  "Event centres": "Event centre",
};

export function categorySingular(category: string) {
  return singular[category] ?? category;
}
