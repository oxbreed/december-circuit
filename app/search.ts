import { eventNameAndVenue, eventSlug } from "./event-view";
import { events } from "./events";
import { placesOnFile } from "./place-catalog";
import {
  guidesHubPath,
  seasonGuideIndex,
  visaCheck,
} from "./season-guides";

export type SearchKind = "event" | "place" | "guide";

export type SearchHit = {
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  score: number;
};

const GUIDE_PAGES: {
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
}[] = [
  {
    title: "Trip guide",
    subtitle: "Visa · Arrive · Stay · Get around · What is on",
    href: "/guide",
    keywords:
      "guide trip tourist visa entry arrive stay hotels get around rides what is on lagos accra calabar",
  },
  {
    title: "Visa and entry",
    subtitle: "Official Nigeria and Ghana notes on the trip guide",
    href: "/guide#entry",
    keywords: "visa entry passport nigeria ghana immigration",
  },
  {
    title: "Arrive",
    subtitle: "Airports and arrival notes on the trip guide",
    href: "/guide#arrive",
    keywords: "arrive airport flight arrival murtala muhammed",
  },
  {
    title: "Stay",
    subtitle: "Hotels and short-stay rows on the trip guide",
    href: "/guide#stay",
    keywords: "stay hotel short-stay lodging accommodation",
  },
  {
    title: "Get around",
    subtitle: "Ride apps and transport on the trip guide",
    href: "/guide#around",
    keywords: "get around ride bolt indrive transport car rental",
  },
  {
    title: "What is on",
    subtitle: "Confirmed events listed on the trip guide",
    href: "/guide#on",
    keywords: "what is on events calendar confirmed",
  },
  {
    title: "Season guides",
    subtitle: "Flytime, Carnival, Lagos, Accra, visas",
    href: guidesHubPath,
    keywords: "season guides hub december flytime carnival lagos accra visa",
  },
];

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokens(value: string) {
  return fold(value)
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function scoreHaystack(queryTokens: string[], haystack: string) {
  const hay = fold(haystack);
  if (!hay) return 0;
  let score = 0;
  const joined = queryTokens.join(" ");
  if (joined.length >= 3 && hay.includes(joined)) score += 12;
  for (const token of queryTokens) {
    if (hay.includes(token)) {
      score += token.length >= 4 ? 4 : 2;
      continue;
    }
    const words = hay.split(/\s+/);
    for (const word of words) {
      if (word.startsWith(token) || (token.length >= 4 && word.includes(token))) {
        score += 1;
        break;
      }
    }
  }
  return score;
}

function guideCatalog() {
  const pages = [...GUIDE_PAGES];
  for (const guide of seasonGuideIndex) {
    pages.push({
      title: guide.title,
      subtitle: guide.description,
      href: guide.path,
      keywords: `${guide.title} ${guide.description} ${guide.slug}`,
    });
  }
  const visas = visaCheck();
  const destinationWords = visas.destinations
    .map(
      (destination) =>
        `${destination.country} ${destination.title} ${destination.purpose}`,
    )
    .join(" ");
  pages.push({
    title: "Visa pages",
    subtitle: `Checked ${visas.checkedAtLabel} — US, UK, Canada travellers`,
    href: "/visa",
    keywords: `visa ${visas.note} us uk canada travellers ${visas.checkedAtLabel} ${destinationWords}`,
  });
  for (const page of visas.nationalityPages) {
    pages.push({
      title: `${page.travellerLabel} travellers — visa`,
      subtitle: page.passportNote,
      href: page.path,
      keywords: `${page.travellerLabel} visa ${page.passportNote} ${page.slug}`,
    });
  }
  return pages;
}

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 40;

export function searchDirectory(query: string, limit = DEFAULT_LIMIT): SearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const queryTokens = tokens(trimmed);
  if (queryTokens.length === 0) return [];

  const capped = Math.min(Math.max(1, limit), MAX_LIMIT);
  const hits: SearchHit[] = [];

  for (const event of events) {
    const { name, venue } = eventNameAndVenue(event.summary);
    const haystack = [
      name,
      venue ?? "",
      event.summary,
      event.region,
      event.when,
      event.sourceId ?? "",
      event.urlLabel ?? "",
    ].join(" ");
    const score = scoreHaystack(queryTokens, haystack);
    if (score <= 0) continue;
    hits.push({
      kind: "event",
      title: name,
      subtitle: `${event.region} · ${event.when}`,
      href: `/events/${eventSlug(event)}`,
      score: score + 1,
    });
  }

  for (const place of placesOnFile()) {
    const haystack = [
      place.name,
      place.city,
      place.country,
      place.category,
    ].join(" ");
    const score = scoreHaystack(queryTokens, haystack);
    if (score <= 0) continue;
    hits.push({
      kind: "place",
      title: place.name,
      subtitle: `${place.category} · ${place.city}, ${place.country}`,
      href: `/place/${place.slug}`,
      score,
    });
  }

  for (const page of guideCatalog()) {
    const score = scoreHaystack(
      queryTokens,
      `${page.title} ${page.subtitle} ${page.keywords}`,
    );
    if (score <= 0) continue;
    hits.push({
      kind: "guide",
      title: page.title,
      subtitle: page.subtitle,
      href: page.href,
      score,
    });
  }

  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const seen = new Set<string>();
  const unique: SearchHit[] = [];
  for (const hit of hits) {
    if (seen.has(hit.href)) continue;
    seen.add(hit.href);
    unique.push(hit);
    if (unique.length >= capped) break;
  }
  return unique;
}

export function kindLabel(kind: SearchKind) {
  if (kind === "event") return "Event";
  if (kind === "place") return "Place";
  return "Guide";
}
