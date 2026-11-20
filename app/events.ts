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
    when: "11-20 December",
    summary:
      "Future Fest '26. YBNL: The Reunion with Olamide on 18 December, Asake's M$NEY in Lagos on 20 December, Oasis Ground, Victoria Island.",
    url: "https://www.pulse.ng/story/asake-lagos-concert-future-fest-2026-2026111212324356431",
    urlLabel: "News report",
    sourceId: "future-fest-pulse",
  },
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
      "Detty December Fest. Wizkid on 18 December, Lauryn Hill on 21 December, DJ Tunez and Friends on 24 December, Tungba Christmas on 25 December, Summer Walker on 27 December, Young Thug on 28 December.",
    url: "https://dettydecfest.com/",
    urlLabel: "Organiser's page",
    ticketsUrl: "https://tix.dot360.co/org/livespot/detty-december",
    sourceId: "detty-december-fest",
  },
  {
    region: "Lagos",
    when: "19-23 December",
    summary:
      "ICONIQ FEST Lagos. BNXN on 19 December, Fola on 20 December, Oxlade on 21 December, Ruger on 22 December, Mr P on 23 December, The Lekki Coliseum.",
    url: "https://www.iconiqfest.com/",
    urlLabel: "Organiser's page",
    sourceId: "iconiq-fest",
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
    summary: "Flytime Fest, Eko Convention Centre. Latto and Sexyy Red on 22 December.",
    url: "https://guardian.ng/life/life-features/detty-december-your-guide-to-lagos-concerts/",
    urlLabel: "News report",
    // Artists from the Guardian Nigeria guide (20 Nov 2026). Ingest still only probes
    // flytimefest.com and holds it (DD-2); held rows never touch this seed text.
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
    region: "Lagos",
    when: "26 December",
    summary:
      "Adekunle Gold, The Greatest Showman, with the MUSON Orchestra at the National Theatre.",
    url: "https://www.qed.ng/adekunle-gold-announces-return-of-the-greatest-showman-for-december/",
    urlLabel: "News report",
    sourceId: "adekunle-gold-showman-qed",
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
  {
    region: "Abuja",
    when: "16 December",
    summary: "ICONIQ FEST Abuja. Fola, Cloud 9, Bali Recreational Park.",
    url: "https://www.iconiqfest.com/",
    urlLabel: "Organiser's page",
    sourceId: "iconiq-fest",
  },
  {
    region: "Accra",
    when: "16-31 December",
    summary:
      "AfroFuture Residency, Future Club, 1 Shiashie. Opening night on 16 December, Jazzwrld & Thukuthela on 20 December, Rcee Live on 22 December, Afropolitan Live on 27 December, Victony on 28 December, Young Jonn on 29 December, then a New Year's Eve party.",
    url: "https://www.afrofuture.com/",
    urlLabel: "Organiser's page",
    sourceId: "afrofuture-residency",
  },
  {
    region: "Accra",
    when: "21 December",
    summary: "Black Sherif's Zaama Disco. University of Ghana Sports Stadium.",
    url: "https://www.dailypost.com.gh/ghanas-2026-detty-december-concerts-festivals-and-public-holidays-confirmed/",
    urlLabel: "News report",
    sourceId: "zaama-disco-dailypost",
  },
  {
    region: "Accra",
    when: "24 December",
    summary:
      "Stonebwoy's BHIM Festival. University of Ghana Sports Stadium. Supporting acts are still unannounced.",
    // Date and venue on the organiser's page. Stonebwoy's festival and the pending
    // supporting acts are also reported by GNA:
    // https://gna.org.gh/2026/10/stonebwoys-bhim-festival-2026-moves-to-university-of-ghana-sports-stadium/
    url: "https://bhimfestival.com/",
    urlLabel: "Organiser's page",
    sourceId: "bhim-festival",
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
