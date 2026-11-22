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
  /** Optional stable slug for CMS overlays. Seed rows omit this and use eventSlug(). */
  slug?: string;
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
    when: "23 December",
    summary:
      "AfroJazz Fest, To the Roots. Lagbaja and The Cavemen, Amore Gardens, Lekki.",
    url: "https://afrojazzfest.org/",
    urlLabel: "Organiser's page",
    ticketsUrl: "https://afrojazzfest.org/",
    sourceId: "afrojazz-fest",
  },
  {
    region: "Lagos",
    when: "25 December",
    summary:
      "Flytime Circle, Eko Convention Centre. The lineup is still unannounced.",
    // Punch (opened 22 Nov 2026) names Flytime Circle on 25 December and says
    // further artiste announcements are expected. flytimefest.com still does
    // not name the 2026 Circle night. The Essence House of R&B article is not
    // this row's source.
    url: "https://punchng.com/full-list-lauryn-hill-brandy-lil-baby-others-set-for-lagos-detty-december/",
    urlLabel: "News report",
    sourceId: "flytime-fest-home",
  },
  {
    region: "Lagos",
    when: "26 December",
    summary:
      "Adekunle Gold, The Greatest Showman, with the MUSON Orchestra at the National Theatre.",
    url: "https://www.jetronticket.com/ag-2026",
    urlLabel: "Organiser's page",
    ticketsUrl: "https://www.jetronticket.com/ag-2026",
    sourceId: "adekunle-gold-showman-jetron",
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
  {
    region: "Abidjan",
    when: "27-28 December",
    summary:
      "Mother Africa Festival 2026. 5th edition, with Quavo headlining, at Marcory Zone 4 in Abidjan, Côte d’Ivoire. Organised by KT7 Production. Tickets from 20,000 F CFA (XOF). Hours unconfirmed; previous editions ran 14:00–04:00.",
    // Official festival site motherafricafestival.com resolved but the vhost
    // was suspended (HTTP 503, x-suspended-vhost) when this row was added, so
    // it is omitted. Official tickets: Tikerama.
    url: "https://tikerama.com/fr/evenements/mother-africa-festival-2026",
    urlLabel: "Official page",
    ticketsUrl: "https://tikerama.com/fr/evenements/mother-africa-festival-2026",
    sourceId: "mother-africa-festival-tikerama",
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
