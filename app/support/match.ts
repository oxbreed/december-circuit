import "server-only";

import { events } from "../events";
import { eventNameAndVenue } from "../event-view";
import { faqAnswerPlain, faqItems } from "../faq-items";

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokens(value: string) {
  return fold(value)
    .replace(/[^a-z0-9@./#+]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

const STOP = new Set([
  "the",
  "and",
  "for",
  "are",
  "you",
  "your",
  "with",
  "this",
  "that",
  "from",
  "have",
  "what",
  "when",
  "where",
  "how",
  "does",
  "do",
  "can",
  "about",
  "there",
  "into",
  "any",
]);

function scoreOverlap(query: string[], haystack: string) {
  const hay = new Set(tokens(haystack).filter((token) => !STOP.has(token)));
  let score = 0;
  for (const token of query) {
    if (STOP.has(token)) continue;
    if (hay.has(token)) score += 2;
    else {
      for (const word of hay) {
        if (word.includes(token) || token.includes(word)) {
          score += 1;
          break;
        }
      }
    }
  }
  return score;
}

function keyHits(folded: string, query: Set<string>, keys: string[]) {
  let score = 0;
  for (const key of keys) {
    if (key.includes(" ")) {
      if (folded.includes(key)) score += 4;
    } else if (query.has(key)) {
      score += 3;
    }
  }
  return score;
}

type Candidate = { score: number; reply: string };

function confirmedEventsReply() {
  const lines = events.map((event) => {
    const { name } = eventNameAndVenue(event.summary);
    const source = event.urlLabel?.trim() || "named source";
    return `• ${name} — ${event.region}, ${event.when}. ${event.summary} (${source})`;
  });
  return `Here’s what we have for confirmed events:\n${lines.join("\n")}\nWe don’t list prices or hold bookings here — any ticket link leaves this site.`;
}

const fallback =
  "I’m not sure from what’s listed. The FAQ at /faq, Visa and entry at /guide#entry, or hello@dirtydecember.info might help. I stick to what this directory already publishes — I won’t invent prices, fares, events, or bookings.";

export function matchGroundedReply(question: string) {
  const queryTokens = tokens(question);
  const query = new Set(queryTokens);
  const folded = fold(question);
  const candidates: Candidate[] = [];

  for (const item of faqItems) {
    const plain = faqAnswerPlain(item.answer);
    const score =
      scoreOverlap(queryTokens, item.question) * 2 +
      scoreOverlap(queryTokens, plain);
    if (score >= 3) {
      candidates.push({
        score,
        reply: plain.startsWith("Here’s") || plain.startsWith("I'm") || plain.startsWith("We ")
          ? plain
          : `Here’s what we have. ${plain}`,
      });
    }
  }

  for (const event of events) {
    const { name } = eventNameAndVenue(event.summary);
    const blob = `${name} ${event.region} ${event.when} ${event.summary} ${event.urlLabel ?? ""}`;
    let score = scoreOverlap(queryTokens, blob);
    if (folded.includes(fold(name)) || query.has(fold(event.region))) {
      score += 4;
    }
    if (score >= 3) {
      const source = event.urlLabel?.trim() || "named source";
      candidates.push({
        score,
        reply: `Here’s what we have: ${name} — ${event.region}, ${event.when}. ${event.summary} (${source}). We don’t list a price or booking here.`,
      });
    }
  }

  const intents: { keys: string[]; reply: string }[] = [
    {
      keys: [
        "visa",
        "visas",
        "entry",
        "immigration",
        "passport",
        "ecowas",
        "nigeria",
        "ghana",
      ],
      reply:
        "Here’s the short version: Lagos and Calabar are in Nigeria; Accra is in Ghana. Open /guide#entry for Visa and entry — it walks through the Nigeria Immigration Service Tourism Visa (F5A) page and the Ghana Immigration Service visa pages. We don’t take visa applications, quote fees, or take payment here. The official links on that page have the current rules.",
    },
    {
      keys: ["flight", "flights", "airfare", "fare", "airline", "airport"],
      reply:
        "On Flights, each row opens a Google Flights search. It’s a search — not a fare, a seat, or a booking we hold. Some origin cities use a dated December window noted on that page as a starting point for the season.",
    },
    {
      keys: [
        "bolt",
        "indrive",
        "yango",
        "gozem",
        "heetch",
        "ride",
        "rides",
        "taxi",
        "uber",
        "get around",
        "transport",
      ],
      reply:
        "Flights and /guide#around group third-party ride apps by country for cities on this directory: Bolt and inDrive in Nigeria; Bolt, inDrive, Uber, and Yango in Ghana; Yango and Heetch in Côte d’Ivoire; Yango and Gozem in Cameroon; Gozem in Benin and Togo. Links leave this site — we don’t book rides, quote fares, or show ETAs. Burkina Faso and Niger have no verified ride-app link yet. Car rental and airport organiser pages stay in that same guide section.",
    },
    {
      keys: ["payment", "pay", "ticket", "tickets", "checkout", "booking", "buy"],
      reply:
        "We don’t take payment or hold bookings on this site. If a record already has a ticket link, that link leaves dirtydecember.info. Same idea for stay links and flight searches — they’re not a purchase here.",
    },
    {
      keys: ["list", "submit", "organise", "organize", "partnership", "advertise"],
      reply:
        "You can list something at /list. Events and shows stay unpublished until someone on the team checks them. Visitor notes go to hello@dirtydecember.info; partnership notes to partners@dirtydecember.info. Placements are labeled, and we don’t take payment here.",
    },
    {
      keys: ["affiliated", "affiliation", "livespot", "official"],
      reply:
        "We’re an independent community directory — not affiliated with Livespot360 or Detty December Fest™. A Detty December Fest night can still show up when an organiser page or a named report confirms it, same as any other listing.",
    },
    {
      keys: ["contact", "email", "enquire", "inquiry"],
      reply:
        "For visitor questions, write hello@dirtydecember.info. For partnerships and placements, use partners@dirtydecember.info. Privacy, terms, and the EULA are in the footer.",
    },
  ];

  const askingToList =
    query.has("list") ||
    query.has("submit") ||
    folded.includes("list an event");
  const askingConfirmed =
    !askingToList &&
    (folded.includes("confirmed event") ||
      folded.includes("confirmed events") ||
      folded.includes("whats on") ||
      (query.has("events") && (query.has("confirmed") || query.has("listed"))) ||
      (query.has("event") && query.has("confirmed")));

  if (askingConfirmed) {
    candidates.push({ score: 10, reply: confirmedEventsReply() });
  }

  for (const intent of intents) {
    const score = keyHits(folded, query, intent.keys);
    if (score >= 3) {
      // Prefer clear intent replies over raw FAQ paste when both match.
      candidates.push({ score: score + 12, reply: intent.reply });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best || best.score < 3) {
    return { reply: fallback, matched: false as const };
  }
  return { reply: best.reply, matched: true as const };
}
