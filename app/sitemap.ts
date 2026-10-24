import type { MetadataRoute } from "next";
import { citiesOnFile } from "./cities";
import { eventSlug } from "./event-view";
import { events } from "./events";
import { absoluteUrl } from "./site";

const checked = new Date("2026-10-24");

type Entry = {
  path: string;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/guide", changeFrequency: "weekly", priority: 0.9 },
    { path: "/events", changeFrequency: "daily", priority: 0.95 },
    { path: "/places", changeFrequency: "weekly", priority: 0.85 },
    { path: "/cities", changeFrequency: "weekly", priority: 0.85 },
    { path: "/explore", changeFrequency: "weekly", priority: 0.7 },
    { path: "/flights", changeFrequency: "weekly", priority: 0.75 },
    { path: "/map", changeFrequency: "weekly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/news", changeFrequency: "daily", priority: 0.7 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.8 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
    { path: "/eula", changeFrequency: "yearly", priority: 0.2 },
    { path: "/list", changeFrequency: "monthly", priority: 0.4 },
    ...events.map((event) => ({
      path: `/events/${eventSlug(event)}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...citiesOnFile().map((city) => ({
      path: `/cities/${city.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: checked,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
