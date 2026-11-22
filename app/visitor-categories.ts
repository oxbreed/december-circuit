import { categoryIndex, categoryIndexSlug } from "./explore-categories";
import type { PoiKind } from "./poi-client";

export const VISITOR_CATEGORY_LABELS = [
  "Hotels",
  "Restaurants",
  "Event centres",
  "Short-stay",
  "Car rental",
  "Clubs",
  "Cinemas",
  "Beaches",
  "Beach resorts",
  "Boat clubs",
  "Recreation centres",
] as const;

/** Show a rounded "N+" line only when the curated count reaches this size. */
export const VISITOR_COUNT_LINE_THRESHOLD = 30;

type CategoryNouns = {
  /** Used in "Browse …" lines. */
  browse: string;
  one: string;
  many: string;
};

const CATEGORY_NOUNS: Record<string, CategoryNouns> = {
  Hotels: { browse: "hotels", one: "hotel", many: "hotels" },
  Restaurants: { browse: "restaurants", one: "restaurant", many: "restaurants" },
  "Event centres": { browse: "event centres", one: "event centre", many: "event centres" },
  "Short-stay": { browse: "short stays", one: "short stay", many: "short stays" },
  "Car rental": { browse: "car rental", one: "car rental", many: "car rentals" },
  Clubs: { browse: "clubs", one: "club", many: "clubs" },
  Cinemas: { browse: "cinemas", one: "cinema", many: "cinemas" },
  Beaches: { browse: "beaches", one: "beach", many: "beaches" },
  "Beach resorts": { browse: "beach resorts", one: "beach resort", many: "beach resorts" },
  "Boat clubs": { browse: "boat clubs", one: "boat club", many: "boat clubs" },
  "Recreation centres": {
    browse: "recreation centres",
    one: "recreation centre",
    many: "recreation centres",
  },
  Bars: { browse: "bars", one: "bar", many: "bars" },
  "Practical stops": { browse: "practical stops", one: "practical stop", many: "practical stops" },
  Catering: { browse: "catering", one: "catering page", many: "catering pages" },
};

export type VisitorCategoryEntry = {
  category: string;
  slug: string;
  count: number;
  exploreKind: PoiKind | null;
};

export function visitorCategoryEntries(): VisitorCategoryEntry[] {
  const index = categoryIndex();
  return VISITOR_CATEGORY_LABELS.map((category) => {
    const item = index.find((row) => row.category === category);
    return {
      category,
      slug: categoryIndexSlug(category),
      count: item?.count ?? 0,
      exploreKind: item?.exploreKind ?? null,
    };
  });
}

function nounsFor(category: string): CategoryNouns {
  const known = CATEGORY_NOUNS[category];
  if (known) return known;
  const lower = category.toLowerCase();
  return { browse: lower, one: lower, many: lower };
}

/** Exact count plus the category noun, for a single-category places filter. */
export function categoryCountNoun(category: string, count: number) {
  const nouns = nounsFor(category);
  return count === 1 ? nouns.one : nouns.many;
}

/**
 * Rounded "N+ hotels" when the count is at least 30 (nearest 10 below),
 * otherwise "Browse short stays". Zero-count hubs keep a map or hub fallback.
 */
export function visitorCategoryCountLine(
  count: number,
  category: string,
  exploreKind: PoiKind | null,
) {
  if (count >= VISITOR_COUNT_LINE_THRESHOLD) {
    const rounded = Math.floor(count / 10) * 10;
    return `${rounded}+ ${nounsFor(category).many}`;
  }
  if (count > 0) return `Browse ${nounsFor(category).browse}`;
  if (exploreKind) return "Explore map search";
  return "Category hub";
}

/** Exact result-count kicker for the /places directory. */
export function placesFilterCountLine(count: number, categories: string[]) {
  if (categories.length === 1) {
    return `${count} ${categoryCountNoun(categories[0], count)}`;
  }
  return `${count} ${count === 1 ? "place" : "places"}`;
}
