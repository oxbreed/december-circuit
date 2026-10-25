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
