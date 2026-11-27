import { slugify } from "./cities";
import { events } from "./events";
import { places, type Place } from "./places";
import { categorySingular } from "./seo";

export type PlaceRecord = Place & { slug: string };

export function placeSlug(place: Place) {
  if (place.slug && place.slug.trim()) return place.slug.trim();
  return `${slugify(place.name)}-${slugify(place.city)}`;
}

export function placesOnFile(): PlaceRecord[] {
  const used = new Map<string, number>();
  return places.map((place) => {
    let slug = placeSlug(place);
    const n = (used.get(slug) ?? 0) + 1;
    used.set(slug, n);
    if (n > 1) slug = `${slug}-${slugify(place.country)}-${n}`;
    return { ...place, slug };
  });
}

export function placeBySlug(slug: string) {
  return placesOnFile().find((place) => place.slug === slug) ?? null;
}

export function placeRecordFor(place: Place) {
  return (
    placesOnFile().find(
      (item) =>
        item.name === place.name &&
        item.city === place.city &&
        item.country === place.country &&
        item.category === place.category,
    ) ?? null
  );
}

export function placesInCategory(category: string) {
  return placesOnFile().filter((place) => place.category === category);
}

export function categorySlug(category: string) {
  return slugify(category);
}

export function categoriesOnFile(): { category: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const place of places) {
    counts.set(place.category, (counts.get(place.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({
      category,
      slug: categorySlug(category),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export function categoryBySlug(slug: string) {
  return categoriesOnFile().find((item) => item.slug === slug) ?? null;
}

export function placeDescription(place: Place) {
  const kind = categorySingular(place.category).toLowerCase();
  const where = place.area
    ? `${place.area}, ${place.city}, ${place.country}`
    : `${place.city}, ${place.country}`;
  const detail = place.detail ? ` ${place.detail.replace(/\.$/, "")}.` : "";
  const cityEvents = events.filter((event) => event.region === place.city).length;
  const eventBit =
    cityEvents > 0
      ? ` ${cityEvents} Detty December 2026 ${cityEvents === 1 ? "event is" : "events are"} listed in ${place.city}.`
      : "";
  return `${place.name} is a ${kind} in ${where}.${detail}${eventBit} Open the organiser page for details and booking.`;
}
