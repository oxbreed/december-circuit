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
    const source = event.urlLabel?.trim() || "Source on file";
    return `• ${name} — ${event.region}, ${event.when}. ${event.summary} (${source}.)`;
  });
  return `From the site: Confirmed events on file:\n${lines.join("\n")}\nNo prices or bookings are listed here.`;
}

const fallback =
  "I do not have that on file here. Check /faq, open /guide#entry for visas, or write to hello@dirtydecember.info. I only answer from what this site already publishes, and I will not invent prices, fares, events, or bookings.";

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
        reply: `From the site: ${plain}`,
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
      const source = event.urlLabel?.trim() || "Source on file";
      candidates.push({
        score,
        reply: `From the site: ${name} — ${event.region}, ${event.when}. ${event.summary} (${source}.) No price or booking is listed here.`,
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
        "From the site: Lagos and Calabar are in Nigeria; Accra is in Ghana. Open /guide#entry for the Visa and entry section. It repeats the Nigeria Immigration Service Tourism Visa (F5A) page and the Ghana Immigration Service visa pages. This site does not take a visa application, state a visa fee, or take payment. Read those official links for the current rules.",
    },
    {
      keys: ["flight", "flights", "airfare", "fare", "airline", "airport"],
      reply:
        "From the site: Each row on Flights opens a Google Flights search. It is a search, not a fare, a seat, or a booking. No booking is held on this site. Some origin cities use a dated December search window noted on that page.",
    },
    {
      keys: ["payment", "pay", "ticket", "tickets", "checkout", "booking", "buy"],
      reply:
        "From the site: This site takes no payment and holds no bookings. A ticket link appears only when the record already has one, and that link leaves this site. A stay link and a flight search are not a purchase here either.",
    },
    {
      keys: ["list", "submit", "organise", "organize", "partnership", "advertise"],
      reply:
        "From the site: Use /list to list an event or a place. An event or a show stays unpublished until a person checks it. Visitor listing mail goes to hello@dirtydecember.info. Partnership notes go to partners@dirtydecember.info. Placements are labeled, and this site does not take payment.",
    },
    {
      keys: ["affiliated", "affiliation", "livespot", "official"],
      reply:
        "From the site: This is an independent community directory. It is not affiliated with Livespot360 or Detty December Fest™. A Detty December Fest record can still appear when an organiser page or a named report confirms it.",
    },
    {
      keys: ["contact", "email", "enquire", "inquiry"],
      reply:
        "From the site: Visitor enquiries go to hello@dirtydecember.info. Partnership and placement go to partners@dirtydecember.info. Privacy, terms, and the EULA are linked in the footer.",
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
      candidates.push({ score, reply: intent.reply });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best || best.score < 3) {
    return { reply: fallback, matched: false as const };
  }
  return { reply: best.reply, matched: true as const };
}
