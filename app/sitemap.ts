import type { MetadataRoute } from "next";
import { citiesOnFile } from "./cities";
import { eventSlug } from "./event-view";
import { events } from "./events";
import { absoluteUrl } from "./site";

const checked = "2026-10-21";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/guide",
    "/events",
    "/places",
    "/flights",
    "/map",
    "/about",
    "/privacy",
    "/terms",
    "/list",
    "/sign-in",
    ...events.map((event) => `/events/${eventSlug(event)}`),
    ...citiesOnFile().map((city) => `/cities/${city.slug}`),
  ];

  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: checked,
  }));
}
