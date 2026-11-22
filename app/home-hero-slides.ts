import { events } from "./events";
import { presentEvent } from "./event-view";
import { heroNightSlides, type HeroSlide } from "./hero-nightlife";
import { homeFeaturesFrom } from "./home-featured";
import { landmarks } from "./landmarks";

/**
 * Event posters after the featured ones, shown before the city night photos.
 * Each points at an existing sourced event row; a missing row or poster is skipped.
 */
const morePosterKeys: ReadonlyArray<{ poster: string; sourceId: string; when?: string; date?: string }> = [
  { poster: "/landmarks/iconiq-fest-abuja-2026.jpg", sourceId: "iconiq-fest", when: "16 December" },
  { poster: "/landmarks/afrofuture-future-club-2026.jpg", sourceId: "afrofuture-residency" },
  { poster: "/landmarks/detty-december-fest-summer-walker-2026.jpg", sourceId: "detty-december-fest", date: "27 December" },
  { poster: "/landmarks/detty-december-fest-young-thug-2026.jpg", sourceId: "detty-december-fest", date: "28 December" },
  { poster: "/landmarks/detty-december-fest-2026.jpg", sourceId: "detty-december-fest" },
  { poster: "/landmarks/victony-bonfire-experience-2026.jpg", sourceId: "victony-bonfire-lagos" },
  { poster: "/landmarks/alo-once-upon-a-song-2026.jpg", sourceId: "alo-once-upon-a-song" },
  { poster: "/landmarks/carnival-calabar-2026.jpg", sourceId: "carnival-calabar", when: "26-30 December" },
];

function creditLabel(credit: string | undefined) {
  return credit ? credit.replace(/\s*https?:\/\/\S+$/, "").replace(/\.$/, "") : undefined;
}

/**
 * Homepage hero carousel: featured posters first (homeFeatureKeys order, one
 * slide per poster), then the other event posters, then the city night photos.
 * Changes only the carousel; card fallbacks in share-images.ts still follow
 * the landmarks.ts order.
 */
export function homeHeroSlides(rows = events): HeroSlide[] {
  const slides: HeroSlide[] = [];
  const seen = new Set<string>();

  for (const feature of homeFeaturesFrom(rows)) {
    if (seen.has(feature.poster.src)) continue;
    seen.add(feature.poster.src);
    slides.push({
      kind: "poster",
      src: feature.poster.src,
      alt: feature.poster.alt,
      place: `${feature.artist}, ${feature.title}`,
      city: feature.region,
      date: feature.date,
      href: feature.href,
      credit: creditLabel(feature.poster.credit),
      creditUrl: feature.poster.creditUrl,
    });
  }

  for (const key of morePosterKeys) {
    if (seen.has(key.poster)) continue;
    const event = rows.find(
      (row) => row.sourceId === key.sourceId && (key.when === undefined || row.when === key.when),
    );
    const shot = landmarks.find((item) => item.src === key.poster);
    if (!event || !shot) continue;
    seen.add(key.poster);
    const view = presentEvent(event);
    slides.push({
      kind: "poster",
      src: shot.src,
      alt: shot.alt ?? `${shot.name}, ${shot.city}`,
      place: shot.name,
      city: view.region,
      date: key.date ?? event.when,
      href: view.href,
      credit: creditLabel(shot.credit),
      creditUrl: shot.creditUrl,
    });
  }

  return [...slides, ...heroNightSlides];
}

/**
 * The hero stage. One poster today; the hero shows `HERO_STAGE_SLIDE_COUNT` of the
 * featured posters, so going to about eight slides later is a data change here
 * plus a client wrapper around `HeroStage` for the controls. Event posters only:
 * the night photos stay in `heroNightSlides` for the slideshow API and admin.
 */
export const HERO_STAGE_SLIDE_COUNT = 1;

export type HeroStagePoster = {
  /** Public path of the poster image. */
  src: string;
  alt: string;
  /** Intrinsic size when known; the stage frame is always 4:5 (the image is cropped with object-cover). */
  width?: number;
  height?: number;
  /** Headline of the caption, e.g. "Olamide, YBNL: The Reunion, Future Fest '26". */
  title: string;
  /** City shown beside the date. */
  place: string;
  /** The night shown on the poster, e.g. "18 December". */
  date: string;
  /** Internal event page. */
  href: string;
  credit?: string;
  creditUrl?: string;
  /** CSS object-position for the 4:5 crop, e.g. "50% 30%". */
  objectPosition?: string;
};

export function heroStagePosters(rows = events): HeroStagePoster[] {
  const posters: HeroStagePoster[] = [];
  for (const slide of homeHeroSlides(rows)) {
    if (slide.kind !== "poster") continue;
    posters.push({
      src: slide.src,
      alt: slide.alt,
      title: slide.place,
      place: slide.city,
      date: slide.date,
      href: slide.href,
      credit: slide.credit,
      creditUrl: slide.creditUrl,
    });
    if (posters.length >= HERO_STAGE_SLIDE_COUNT) break;
  }
  return posters;
}
