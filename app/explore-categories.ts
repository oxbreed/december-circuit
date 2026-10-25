/**
 * Bridge Explore POI kinds ↔ /categories/[slug] hubs.
 * Curated rows stay in places.ts. Explore hubs exist even when curated count is 0
 * so Shopping / Car shops / Landmarks are crawlable without inventing directory pins.
 */

import { slugify } from "./cities";
import { poiKindFilters, type PoiKind } from "./poi-client";
import { categoriesOnFile as curatedCategoriesOnFile } from "./place-catalog";

export type ExploreCategoryHub = {
  /** Directory category label (matches places.ts when curated rows exist). */
  category: string;
  slug: string;
  exploreKind: PoiKind;
  /** Short SEO / hub lede — no invented venue claims. */
  blurb: string;
};

/**
 * Explore-backed category hubs. Slugs align with curated places.ts categories
 * where those already exist (Hotels, Restaurants, Short-stay, Car rental, Clubs).
 */
export const exploreCategoryHubs: ExploreCategoryHub[] = [
  {
    category: "Hotels",
    slug: "hotels",
    exploreKind: "hotels",
    blurb:
      "Sourced hotel organiser pages on file, plus OpenStreetMap Explore search for Lagos, Accra, and Calabar.",
  },
  {
    category: "Restaurants",
    slug: "restaurants",
    exploreKind: "restaurants",
    blurb:
      "Sourced restaurant organiser pages on file, plus OpenStreetMap Explore search for Lagos, Accra, and Calabar.",
  },
  {
    category: "Short-stay",
    slug: "short-stay",
    exploreKind: "short_stays",
    blurb:
      "Sourced short-stay organiser pages on file, plus OpenStreetMap apartment / short-let tags in Explore — not an Airbnb scrape.",
  },
  {
    category: "Shopping",
    slug: "shopping",
    exploreKind: "shops",
    blurb:
      "Map search for malls and shops from OpenStreetMap in Lagos, Accra, and Calabar. Curated organiser rows are added only when a clear sourced pattern exists.",
  },
  {
    category: "Car rental",
    slug: "car-rental",
    exploreKind: "car_rental",
    blurb:
      "Sourced car-rental organiser pages on file, plus OpenStreetMap Explore search for Lagos, Accra, and Calabar.",
  },
  {
    category: "Car shops",
    slug: "car-shops",
    exploreKind: "car_shops",
    blurb:
      "Map search for car dealers and repair shops from OpenStreetMap in Lagos, Accra, and Calabar — third-party map data, not checked directory rows.",
  },
  {
    category: "Clubs",
    slug: "clubs",
    exploreKind: "clubs",
    blurb:
      "Sourced club organiser pages on file, plus OpenStreetMap nightclub, bar, and pub search for Lagos, Accra, and Calabar (optional Google / Foursquare when configured). Map / third-party data — not checked directory rows.",
  },
  {
    category: "Bars",
    slug: "bars",
    exploreKind: "clubs",
    blurb:
      "Sourced bar organiser pages on file. Map nightlife search (bars, pubs, clubs) for Lagos, Accra, and Calabar lives on Explore — same OSM / optional Google path as Clubs.",
  },
  {
    category: "Landmarks",
    slug: "landmarks",
    exploreKind: "landmarks",
    blurb:
      "Map search for attractions, museums, and monuments from OpenStreetMap in Lagos, Accra, and Calabar. Museums and ports already on file stay under Practical stops until a sourced landmark row is added.",
  },
];

export function exploreHubBySlug(slug: string): ExploreCategoryHub | null {
  return exploreCategoryHubs.find((hub) => hub.slug === slug) ?? null;
}

export function exploreHubByKind(kind: PoiKind): ExploreCategoryHub | null {
  return exploreCategoryHubs.find((hub) => hub.exploreKind === kind) ?? null;
}

export function exploreKindLabel(kind: PoiKind): string {
  return poiKindFilters[kind].label;
}

export type CategoryIndexItem = {
  category: string;
  slug: string;
  count: number;
  exploreKind: PoiKind | null;
  blurb: string | null;
};

/**
 * Union of curated place categories and Explore hubs for /west-africa, sitemap, and
 * generateStaticParams. Curated counts win when a slug already exists in places.ts.
 */
export function categoryIndex(): CategoryIndexItem[] {
  const curated = curatedCategoriesOnFile();
  const bySlug = new Map<string, CategoryIndexItem>();

  for (const item of curated) {
    bySlug.set(item.slug, {
      category: item.category,
      slug: item.slug,
      count: item.count,
      exploreKind: null,
      blurb: null,
    });
  }

  for (const hub of exploreCategoryHubs) {
    const existing = bySlug.get(hub.slug);
    if (existing) {
      bySlug.set(hub.slug, {
        ...existing,
        exploreKind: hub.exploreKind,
        blurb: hub.blurb,
      });
      continue;
    }
    bySlug.set(hub.slug, {
      category: hub.category,
      slug: hub.slug,
      count: 0,
      exploreKind: hub.exploreKind,
      blurb: hub.blurb,
    });
  }

  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.category.localeCompare(b.category),
  );
}

export function categoryIndexBySlug(slug: string): CategoryIndexItem | null {
  return categoryIndex().find((item) => item.slug === slug) ?? null;
}

/** Stable slug helper for tests / callers that only have a category label. */
export function categoryIndexSlug(category: string): string {
  const hub = exploreCategoryHubs.find((item) => item.category === category);
  if (hub) return hub.slug;
  return slugify(category);
}
