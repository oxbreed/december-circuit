import publishedFile from "../data/event-ingest/published.json";
import { mergeSeedWithIngest, type IngestEvent } from "./event-ingest-merge";

export type CircuitEvent = {
  region: string;
  when: string;
  summary: string;
  url?: string;
  urlLabel?: string;
  ticketsUrl?: string;
  /** Tier-1 feed id from event-feeds.ts when the row was confirmed by ingest. */
  sourceId?: string;
};

/**
 * Curated seed — the directory baseline. Ingest may refresh matching rows when
 * a Tier-1 source still states the fields. Failed fetches never delete a seed row.
 */
export const seedEvents: CircuitEvent[] = [
  {
    region: "Lagos",
    when: "17-19 December",
    summary: "Davido, Oriade residency, three nights at the National Theatre.",
    url: "https://www.dmwhq.com/residency",
    urlLabel: "Organiser's page",
    sourceId: "oriade-residency",
  },
  {
    region: "Lagos",
    when: "18-30 December",
    summary:
      "Detty December Fest. Wizkid on 18 December, DJ Tunez and Friends on 24 December, Tungba Christmas on 25 December.",
    url: "https://dettydecfest.com/",
    urlLabel: "Organiser's page",
    ticketsUrl: "https://tix.dot360.co/org/livespot/detty-december",
    sourceId: "detty-december-fest",
  },
  {
    region: "Lagos",
    when: "20 December",
    summary: "Flytime House of R&B, Brandy, Eko Convention Centre.",
    url: "https://www.essence.com/entertainment/brandy-flytimes-house-of-r-and-b/",
    urlLabel: "News report",
    sourceId: "flytime-house-rb-essence",
  },
  {
    region: "Lagos",
    when: "21 December",
    summary:
      "Coca-Cola Rhythm Unplugged, Lil Baby and Kehlani, Eko Convention Centre.",
    url: "https://www.stylerave.com/rhythm-unplugged-2026-headliners/",
    urlLabel: "News report",
    sourceId: "rhythm-unplugged-stylerave",
  },
  {
    region: "Lagos",
    when: "22-24 December",
    summary:
      "Flytime Fest, Eko Convention Centre. Headliners for 2026 are still unannounced.",
    url: "https://www.essence.com/entertainment/brandy-flytimes-house-of-r-and-b/",
    urlLabel: "News report",
    // Held by ingest until an organiser page names this night (DD-2).
    sourceId: "flytime-fest-home",
  },
  {
    region: "Lagos",
    when: "25 December",
    summary:
      "Flytime Circle, Eko Convention Centre. The lineup is still unannounced.",
    url: "https://www.essence.com/entertainment/brandy-flytimes-house-of-r-and-b/",
    urlLabel: "News report",
    sourceId: "flytime-fest-home",
  },
  {
    region: "Calabar",
    when: "26-30 December",
    summary:
      "Carnival Calabar. Theme: Rethinking Our Collective Destiny. Cultural Carnival and Night of Kings & Queens on the 26th, Junior Carnival on the 27th, Parade of the Bands on the 28th, Bikers Carnival on the 29th, Nyoro Ekpe on the 30th.",
    url: "https://www.carnival.crossriverstate.gov.ng/",
    urlLabel: "Official page",
    sourceId: "carnival-calabar",
  },
  {
    region: "Ghana",
    when: "1 December 2026 to 3 January 2027",
    summary:
      "December in Ghana, under the Ghana Tourism Authority and the Black Star Experience. These season dates are official.",
    url: "https://www.myjoyonline.com/gta-unveils-december-in-gh-2026-calendar-with-150-events/",
    urlLabel: "News report",
    sourceId: "december-in-ghana-myjoy",
  },
  // Seed rows added 20 Nov 2026. Appended after the existing list so a rebase
  // onto PR #7 (content/more-events-batch-1) stays a trivial append.
  {
    region: "Abuja",
    when: "4 December",
    summary:
      "Victony, The Bonfire Experience. The venue has not been announced yet. Starts at 8pm.",
    url: "https://mainlandblockparty.com/event/capital-blockparty-the-bonfire-experience",
    urlLabel: "Organiser's page",
    sourceId: "victony-bonfire-abuja",
  },
  {
    region: "Abuja",
    when: "5 December",
    summary:
      "Cibusa x The Believers Music Concert, with Soundboi BME. The venue is still to be confirmed.",
    url: "https://www.instagram.com/abujaevents/reel/DfUulaPsbqS/",
    urlLabel: "Event roundup",
    sourceId: "abujakulture-december-roundup",
  },
  {
    region: "Abuja",
    when: "5 December",
    summary:
      "Moelogo Live in Abuja, The Yoruba Healer Live Experience at the UpeRoom by Jireh Multimedia.",
    url: "https://tix.africa/discover/moelogo-live-in-abuja",
    urlLabel: "Organiser's page",
    sourceId: "moelogo-abuja-tix",
  },
  {
    region: "Abuja",
    when: "6 December",
    summary: "Johnny's Room Live 8, Johnny Drille at the Exhibition Pavilion.",
    url: "https://johnnydrille.tix.to/jrl8",
    urlLabel: "Organiser's page",
    sourceId: "johnny-room-live-8",
  },
  {
    region: "Abuja",
    when: "11 December",
    summary:
      "EJANLA FEST at the Harrow Park, Wuse. Carnival from 11am, concert at 7pm.",
    url: "https://tix.africa/discover/ejanlafest",
    urlLabel: "Organiser's page",
    sourceId: "ejanla-fest-tix",
  },
  {
    region: "Abuja",
    when: "12-13 December",
    summary: "DJ Tunez Blackout at the Cage Club, Drip Mall, Wuse 2.",
    url: "https://www.visitabuja.org/event/dj-tunez-blackout-abuja/",
    urlLabel: "Event listing",
    sourceId: "dj-tunez-blackout-visitabuja",
  },
  {
    region: "Abuja",
    when: "13 December",
    summary:
      "Live Out Loud Music Festival, Wizkid at the Eagle Square. Gates at 4pm, Wizkid on stage at 10pm.",
    url: "https://www.lolmusicfest.com/",
    urlLabel: "Organiser's page",
    ticketsUrl: "https://wizkid.tix.africa/",
    sourceId: "lol-music-fest",
  },
  {
    region: "Lagos",
    when: "13 December",
    summary:
      "ÀLÓ: Once Upon a Song at the Shell Hall, MUSON Centre, Onikan. African folk music and storytelling, from 7pm.",
    url: "https://tix.dot360.co/event/a-lo-once-upon-a-song",
    urlLabel: "Organiser's page",
    sourceId: "alo-once-upon-a-song",
  },
  {
    region: "Abuja",
    when: "19 December",
    summary: "Rise of the Machine. The venue is still to be confirmed.",
    url: "https://www.instagram.com/abujaevents/reel/DfUulaPsbqS/",
    urlLabel: "Event roundup",
    sourceId: "abujakulture-december-roundup",
  },
  {
    region: "Abuja",
    when: "19 December",
    summary:
      "Apitainment Music Festival, Seyi Vibez at the Abuja Velodrome. Starts at 7pm.",
    url: "https://www.apitix.com/product/seyi-vibez-live-in-abuja/",
    urlLabel: "Organiser's page",
    sourceId: "apitainment-seyi-apitix",
  },
  {
    region: "Abuja",
    when: "22 December",
    summary: "The Cavemen, Cavy Fest at the Bali City Park, Wuse 2. Starts at 7pm.",
    url: "https://www.woya.me/programme/abuja/event/67a10dba-b46f-478c-bc2f-75b79471c2ea",
    urlLabel: "Event listing",
    sourceId: "cavy-fest-woya",
  },
  {
    region: "Abuja",
    when: "24 December",
    summary: "Season Fest. The venue is still to be confirmed.",
    url: "https://www.instagram.com/abujaevents/reel/DfUulaPsbqS/",
    urlLabel: "Event roundup",
    sourceId: "abujakulture-december-roundup",
  },
  {
    region: "Abuja",
    when: "24 December",
    summary: "Mr P Live. The venue is still to be confirmed.",
    url: "https://www.instagram.com/abujaevents/reel/DfUulaPsbqS/",
    urlLabel: "Event roundup",
    sourceId: "abujakulture-december-roundup",
  },
  {
    region: "Lagos",
    when: "26 December",
    summary:
      "Victony, The Bonfire Experience. The venue has not been announced yet. Starts at 8pm.",
    url: "https://mainlandblockparty.com/event/island-blockparty-the-bonfire-experience",
    urlLabel: "Organiser's page",
    sourceId: "victony-bonfire-lagos",
  },
];

function publishedFromSnapshot(): IngestEvent[] {
  const events = (publishedFile as { events?: IngestEvent[] }).events;
  return Array.isArray(events) ? events : [];
}

/**
 * Public directory list used by home, /events, city pages, Explore links, and
 * GET /api/events. Re-run `npm run ingest:events` on the 3-day cadence to refresh.
 */
export const events: CircuitEvent[] = mergeSeedWithIngest(
  seedEvents,
  publishedFromSnapshot(),
);
