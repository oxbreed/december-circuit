import { events } from "../events";
import { presentEvent } from "../event-view";
import { placesOnFile } from "../place-catalog";

export type AdminEventRow = {
  slug: string;
  name: string;
  venue: string;
  when: string;
  region: string;
  href: string;
  url?: string;
  ticketsUrl?: string;
  sourceId?: string;
  haystack: string;
};

export type AdminPlaceRow = {
  slug: string;
  name: string;
  city: string;
  country: string;
  category: string;
  href: string;
  url: string;
  haystack: string;
};

export function eventRowsForAdmin(): AdminEventRow[] {
  return events.map((event) => {
    const view = presentEvent(event);
    const haystack = [
      view.name,
      view.venue,
      view.when,
      view.region,
      view.summary,
      event.sourceId,
      event.url,
      event.ticketsUrl,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return {
      slug: view.slug,
      name: view.name,
      venue: view.venue ?? "",
      when: view.when,
      region: view.region,
      href: view.href,
      url: event.url,
      ticketsUrl: event.ticketsUrl,
      sourceId: event.sourceId,
      haystack,
    };
  });
}

export function placeRowsForAdmin(): AdminPlaceRow[] {
  return placesOnFile().map((place) => ({
    slug: place.slug,
    name: place.name,
    city: place.city,
    country: place.country,
    category: place.category,
    href: `/place/${place.slug}`,
    url: place.url,
    haystack: [place.name, place.city, place.country, place.category, place.area, place.detail]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }));
}
