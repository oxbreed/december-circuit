import { events, type CircuitEvent } from "./events";
import { presentEvent } from "./event-view";
import { landmarks, type FramePhoto } from "./landmarks";
import { eventTripId } from "./trip";

/**
 * Homepage "Featured this season" cards and the poster slides at the front of
 * the homepage hero carousel. Each card points at an existing sourced event row
 * (by sourceId and, when needed, its `when`) and names the official poster in
 * landmarks.ts it should show. A night inside a longer festival (Lauryn Hill at
 * Detty December Fest, Olamide and Asake at Future Fest) links to that
 * festival's event page. Never invents events: a key whose row or poster is
 * missing is skipped.
 *
 * Artist picks beyond the named five follow the TurnTable Official Artiste
 * Top 100 (week of 16 Nov 2026: Asake 1, FOLA 2, Seyi Vibez 3, BNXN 4) and the
 * Accra headliners already on file (Black Sherif, Stonebwoy).
 * https://www.turntablecharts.com/charts/3
 *
 * /events keeps its own major list in event-major.ts.
 */
export type HomeFeatureKey = {
  id: string;
  artist: string;
  title: string;
  /** The night shown on the card, e.g. "18 December". */
  date: string;
  sourceId: string;
  /** Pick one row when a sourceId has several. */
  when?: string;
  /** `src` of the poster in landmarks.ts. */
  poster: string;
};

export const homeFeatureKeys: ReadonlyArray<HomeFeatureKey> = [
  {
    id: "olamide-ybnl-reunion",
    artist: "Olamide",
    title: "YBNL: The Reunion, Future Fest '26",
    date: "18 December",
    sourceId: "future-fest-pulse",
    poster: "/landmarks/future-fest-2026.jpg",
  },
  {
    id: "wizkid-live-out-loud",
    artist: "Wizkid",
    title: "Live Out Loud Music Festival, Eagle Square",
    date: "13 December",
    sourceId: "lol-music-fest",
    poster: "/landmarks/live-out-loud-wizkid-abuja-2026.jpg",
  },
  {
    id: "lauryn-hill-detty-december-fest",
    artist: "Lauryn Hill",
    title: "Detty December Fest",
    date: "21 December",
    sourceId: "detty-december-fest",
    poster: "/landmarks/detty-december-fest-lauryn-hill-2026.jpg",
  },
  {
    id: "lil-baby-rhythm-unplugged",
    artist: "Lil Baby",
    title: "Coca-Cola Rhythm Unplugged",
    date: "21 December",
    sourceId: "rhythm-unplugged-stylerave",
    poster: "/landmarks/coca-cola-rhythm-unplugged-2026.jpg",
  },
  {
    id: "davido-oriade",
    artist: "Davido",
    title: "Oriade residency, National Theatre",
    date: "17-19 December",
    sourceId: "oriade-residency",
    poster: "/landmarks/oriade-residency.jpg",
  },
  {
    id: "asake-mney-in-lagos",
    artist: "Asake",
    title: "M$NEY in Lagos, The Oasis",
    date: "20 December",
    sourceId: "future-fest-pulse",
    poster: "/landmarks/asake-money-in-lagos-2026.jpg",
  },
  {
    id: "seyi-vibez-apitainment",
    artist: "Seyi Vibez",
    title: "Apitainment Music Festival",
    date: "19 December",
    sourceId: "apitainment-seyi-apitix",
    poster: "/landmarks/apitainment-seyi-vibez-abuja-2026.jpg",
  },
  {
    id: "bnxn-fola-iconiq-lagos",
    artist: "BNXN & FOLA",
    title: "ICONIQ FEST Lagos, with Oxlade, Ruger and Mr P",
    date: "19-23 December",
    sourceId: "iconiq-fest",
    when: "19-23 December",
    poster: "/landmarks/iconiq-fest-lagos-2026.jpg",
  },
  {
    id: "black-sherif-zaama-disco",
    artist: "Black Sherif",
    title: "Zaama Disco",
    date: "21 December",
    sourceId: "zaama-disco-dailypost",
    poster: "/landmarks/zaama-disco-2026.jpg",
  },
  {
    id: "stonebwoy-bhim",
    artist: "Stonebwoy",
    title: "BHIM Festival",
    date: "24 December",
    sourceId: "bhim-festival",
    poster: "/landmarks/bhim-festival-2026.jpg",
  },
];

export type HomePoster = {
  src: string;
  alt: string;
  name: string;
  city: string;
  credit?: string;
  creditUrl?: string;
};

export type HomeFeature = {
  id: string;
  artist: string;
  title: string;
  date: string;
  region: string;
  href: string;
  tripId: string;
  poster: HomePoster;
};

export function posterFrom(shot: FramePhoto): HomePoster {
  return {
    src: shot.src,
    alt: shot.alt ?? `${shot.name}, ${shot.city}`,
    name: shot.name,
    city: shot.city,
    credit: shot.credit,
    creditUrl: shot.creditUrl,
  };
}

export function homeFeaturesFrom(rows: CircuitEvent[]): HomeFeature[] {
  const out: HomeFeature[] = [];
  for (const key of homeFeatureKeys) {
    const event = rows.find(
      (row) => row.sourceId === key.sourceId && (key.when === undefined || row.when === key.when),
    );
    const shot = landmarks.find((item) => item.src === key.poster);
    if (!event || !shot) continue;
    const view = presentEvent(event);
    out.push({
      id: key.id,
      artist: key.artist,
      title: key.title,
      date: key.date,
      region: view.region,
      href: view.href,
      tripId: eventTripId(event),
      poster: posterFrom(shot),
    });
  }
  return out;
}

export function homeFeatures(): HomeFeature[] {
  return homeFeaturesFrom(events);
}
