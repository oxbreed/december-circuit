import type { MetadataRoute } from "next";
import { citiesOnFile, cityIsThin } from "./cities";
import { countriesOnFile } from "./countries";
import { eventSlug } from "./event-view";
import { events } from "./events";
import { landmarks } from "./landmarks";
import { categoryIndex } from "./explore-categories";
import { placesOnFile } from "./place-catalog";
import { seasonGuideIndex, visaCheck } from "./season-guides";
import { absoluteUrl } from "./site";

const checked = new Date("2026-10-26");

type Entry = {
  path: string;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
  images?: string[];
};

export default function sitemap(): MetadataRoute.Sitemap {
  const landmarkImages = landmarks.map((item) => absoluteUrl(item.src));
  const heroImage = absoluteUrl("/hero-lagos-night.jpg");

  const entries: Entry[] = [
    {
      path: "/",
      changeFrequency: "daily",
      priority: 1,
      images: [heroImage, ...landmarkImages.slice(0, 8)],
    },
    { path: "/detty-december", changeFrequency: "daily", priority: 0.98 },
    { path: "/west-africa", changeFrequency: "weekly", priority: 0.96 },
    { path: "/guide", changeFrequency: "weekly", priority: 0.9 },
    { path: "/guides", changeFrequency: "weekly", priority: 0.92 },
    { path: "/visa", changeFrequency: "monthly", priority: 0.88 },
    ...visaCheck().nationalityPages.map((page) => ({
      path: page.path,
      changeFrequency: "monthly" as const,
      priority: 0.87,
    })),
    ...seasonGuideIndex.map((guide) => ({
      path: guide.path,
      changeFrequency: "daily" as const,
      priority: 0.93,
    })),
    { path: "/events", changeFrequency: "daily", priority: 0.95 },
    { path: "/places", changeFrequency: "weekly", priority: 0.85 },
    { path: "/cities", changeFrequency: "weekly", priority: 0.85 },
    { path: "/explore", changeFrequency: "weekly", priority: 0.7 },
    { path: "/flights", changeFrequency: "weekly", priority: 0.75 },
    { path: "/map", changeFrequency: "weekly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/news", changeFrequency: "daily", priority: 0.7 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.8 },
    { path: "/search", changeFrequency: "weekly", priority: 0.55 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
    { path: "/eula", changeFrequency: "yearly", priority: 0.2 },
    { path: "/list", changeFrequency: "monthly", priority: 0.4 },
    ...countriesOnFile().map((country) => ({
      path: `/countries/${country.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.86,
    })),
    ...categoryIndex().map((cat) => ({
      path: `/categories/${cat.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.82,
    })),
    ...events.map((event) => ({
      path: `/events/${eventSlug(event)}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    // Thin cities (fewer than 3 verified records) stay noindex and out of the sitemap.
    ...citiesOnFile()
      .filter((city) => !cityIsThin(city))
      .map((city) => ({
        path: `/cities/${city.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ...placesOnFile().map((place) => ({
      path: `/place/${place.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];

  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: checked,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    ...(entry.images ? { images: entry.images } : {}),
  }));
}
