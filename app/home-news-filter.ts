import type { TickerItem } from "./ticker-events";

/**
 * Homepage news keeps only headlines that help a Detty December visitor.
 * Case-insensitive match on the headline: the season, events and nightlife, the cities
 * the directory covers, and travel/entry topics. "Nigeria" and "Ghana" alone are
 * deliberately not keywords (too much general news).
 */
const SEASON_KEYWORDS = [
  "detty",
  "december",
  "christmas",
  "festive",
  "festival",
  "concert",
  "carnival",
  "afrobeat",
  "nightlife",
  "tours?\\b",
  "tickets?",
  "live in",
  "headline",
  "lagos",
  "accra",
  "abuja",
  "calabar",
  "kumasi",
  "dakar",
  "abidjan",
  "visas?\\b",
  "flights?",
  "airport",
  "airline",
  "tourism",
  "travel",
  "hotel",
  "beach",
];

const SEASON_PATTERN = new RegExp(`\\b(?:${SEASON_KEYWORDS.join("|")})`, "i");

export function isSeasonHeadline(headline: string) {
  return SEASON_PATTERN.test(headline);
}

export function seasonNews(items: TickerItem[], limit = 3) {
  return items.filter((item) => isSeasonHeadline(item.headline)).slice(0, limit);
}
