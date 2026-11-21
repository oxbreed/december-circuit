import { cache } from "react";
import { events } from "./events";
import { homeFeatureKeys, homeFeaturesFrom, type HomeFeature, type HomeFeatureKey } from "./home-featured";
import { landmarks, type FramePhoto } from "./landmarks";
import { places, type Place } from "./places";
import { placesOnFile, type PlaceRecord, placeSlug } from "./place-catalog";
import {
  listPublicDirectoryEntries,
  mergeEventsWithEntries,
  mergeFeaturedWithEntries,
  mergeLandmarksWithEntries,
  mergePlacesWithEntries,
  placementFromEntry,
  isLiveNow,
} from "./directory-entries";
import { eventBySlug, eventSlug } from "./event-view";
import type { CircuitEvent } from "./events";

export const liveEvents = cache(async (): Promise<CircuitEvent[]> => {
  const entries = await listPublicDirectoryEntries();
  if (entries.length === 0) return events;
  return mergeEventsWithEntries(events, entries);
});

export const livePlaces = cache(async (): Promise<Place[]> => {
  const entries = await listPublicDirectoryEntries();
  if (entries.length === 0) return places;
  return mergePlacesWithEntries(places, entries);
});

export const livePlacesOnFile = cache(async (): Promise<PlaceRecord[]> => {
  const list = await livePlaces();
  if (list === places) return placesOnFile();
  const used = new Map<string, number>();
  return list.map((place) => {
    let slug = place.slug ?? placeSlug(place);
    const n = (used.get(slug) ?? 0) + 1;
    used.set(slug, n);
    if (n > 1) slug = `${slug}-${n}`;
    return { ...place, slug };
  });
});

export const liveLandmarks = cache(async (): Promise<FramePhoto[]> => {
  const entries = await listPublicDirectoryEntries();
  if (entries.length === 0) return landmarks;
  return mergeLandmarksWithEntries(landmarks, entries);
});

export const liveFeaturedKeys = cache(async (): Promise<HomeFeatureKey[]> => {
  const entries = await listPublicDirectoryEntries();
  if (entries.length === 0) return [...homeFeatureKeys];
  return mergeFeaturedWithEntries(homeFeatureKeys, entries);
});

export const liveHomeFeatures = cache(async (): Promise<HomeFeature[]> => {
  const [keys, listed, shots] = await Promise.all([liveFeaturedKeys(), liveEvents(), liveLandmarks()]);
  // homeFeaturesFrom is bound to module landmarks/events; rebuild from keys here.
  const { posterFrom } = await import("./home-featured");
  const { presentEvent } = await import("./event-view");
  const { eventTripId } = await import("./trip");
  const features: HomeFeature[] = [];
  for (const key of keys) {
    const event = listed.find((row) => row.sourceId === key.sourceId && (!key.when || row.when === key.when));
    const poster = shots.find((row) => row.src === key.poster);
    if (!event || !poster) continue;
    const view = presentEvent(event);
    features.push({
      id: key.id,
      artist: key.artist,
      title: key.title,
      date: key.date,
      region: view.region,
      href: view.href,
      tripId: eventTripId(event),
      poster: posterFrom(poster),
    });
  }
  return features;
});

export async function liveEventBySlug(slug: string) {
  const listed = await liveEvents();
  return eventBySlug(slug, listed);
}

export async function livePlaceBySlug(slug: string) {
  const listed = await livePlacesOnFile();
  return listed.find((place) => place.slug === slug) ?? null;
}

export const livePlacements = cache(async () => {
  const entries = await listPublicDirectoryEntries();
  return entries
    .filter((row) => row.kind === "placement" && isLiveNow(row))
    .map(placementFromEntry)
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
});

export function eventPublicHref(event: CircuitEvent) {
  return `/events/${eventSlug(event)}`;
}
