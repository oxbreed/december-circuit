import { categoryIndex, categoryIndexSlug } from "./explore-categories";
import type { PoiKind } from "./poi-client";

export const VISITOR_CATEGORY_LABELS = [
  "Hotels",
  "Restaurants",
  "Event centres",
  "Short-stay",
  "Car rental",
  "Clubs",
] as const;

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

export function visitorCategoryCountLine(count: number, exploreKind: PoiKind | null) {
  if (count > 0) return `${count} ${count === 1 ? "place" : "places"} on file`;
  if (exploreKind) return "Explore map search";
  return "Category hub";
}
