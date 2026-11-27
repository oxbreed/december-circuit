import { pinForName } from "./geo";
import type { Place } from "./places";

/**
 * Thin place rule: a place page is indexable only when it carries something
 * beyond name, city and link, which is a street or area line, a sourced detail
 * line or sourced map coordinates. Everything else stays reachable for people
 * but is noindex, follow and left out of the sitemap.
 */
export function placeIsThin(place: Pick<Place, "name" | "city" | "area" | "detail">) {
  if (place.area && place.area.trim()) return false;
  if (place.detail && place.detail.trim()) return false;
  return !pinForName(place.city, place.name);
}
