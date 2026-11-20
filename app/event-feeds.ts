/**
 * Tier-1 / official / named sources already used on the directory.
 * Ingest only fetches this allowlist. Entertainment RSS (news-feeds.ts) is not
 * an event publisher.
 */
export type EventFeedLabel = "Organiser's page" | "Official page" | "News report" | "Event roundup" | "Event listing";

export type EventFeedSource = {
  /** Stable id stored on published rows as sourceId. */
  id: string;
  label: EventFeedLabel;
  url: string;
  /** Region used when the page itself does not name a directory city. */
  regionHint: string;
  /**
   * html — parse page text with a named extractor.
   * carnival-schedule-js — official schedule chunk linked from the Carnival SPA.
   * tickets-html — outbound ticket collection page (facts only; never prices).
   * probe — fetch only; never auto-publish from this URL alone.
   */
  kind: "html" | "carnival-schedule-js" | "tickets-html" | "probe";
  extractor: string;
};

export const EVENT_INGEST_CADENCE_DAYS = 3;

export const eventFeedSources: readonly EventFeedSource[] = [
  {
    id: "oriade-residency",
    label: "Organiser's page",
    url: "https://www.dmwhq.com/residency",
    regionHint: "Lagos",
    kind: "html",
    extractor: "oriade",
  },
  {
    id: "detty-december-fest",
    label: "Organiser's page",
    url: "https://dettydecfest.com/",
    regionHint: "Lagos",
    kind: "html",
    extractor: "detty-fest",
  },
  {
    id: "detty-december-tickets",
    label: "Organiser's page",
    url: "https://tix.dot360.co/org/livespot/detty-december",
    regionHint: "Lagos",
    kind: "tickets-html",
    extractor: "detty-tickets",
  },
  {
    id: "rhythm-unplugged-stylerave",
    label: "News report",
    url: "https://www.stylerave.com/rhythm-unplugged-2026-headliners/",
    regionHint: "Lagos",
    kind: "html",
    extractor: "rhythm-unplugged",
  },
  {
    id: "flytime-house-rb-essence",
    label: "News report",
    url: "https://www.essence.com/entertainment/brandy-flytimes-house-of-r-and-b/",
    regionHint: "Lagos",
    kind: "html",
    extractor: "flytime-house-rb",
  },
  {
    id: "flytime-fest-home",
    label: "Organiser's page",
    url: "https://www.flytimefest.com/",
    regionHint: "Lagos",
    kind: "probe",
    extractor: "flytime-home",
  },
  {
    id: "carnival-calabar",
    label: "Official page",
    url: "https://www.carnival.crossriverstate.gov.ng/",
    regionHint: "Calabar",
    kind: "carnival-schedule-js",
    extractor: "carnival-calabar",
  },
  {
    id: "december-in-ghana-myjoy",
    label: "News report",
    url: "https://www.myjoyonline.com/gta-unveils-december-in-gh-2026-calendar-with-150-events/",
    regionHint: "Ghana",
    kind: "html",
    extractor: "december-in-ghana",
  },
  {
    id: "afestacc-2026",
    label: "Official page",
    url: "https://events.auda-nepad.org/afestacc26",
    regionHint: "Accra",
    kind: "html",
    extractor: "afestacc",
  },
  {
    id: "december-in-ghana-official",
    label: "Organiser's page",
    url: "https://decemberingh.com/",
    regionHint: "Ghana",
    kind: "probe",
    extractor: "decemberingh-home",
  },
  {
    id: "ghana-tourism-black-star",
    label: "Official page",
    url: "https://ghana.travel/black-star-experience",
    regionHint: "Ghana",
    kind: "probe",
    extractor: "ghana-travel-bse",
  },
  // Seed rows added 20 Nov 2026. Probe only: ingest fetches and holds, the seed row stays.
  {
    id: "future-fest-pulse",
    label: "News report",
    url: "https://www.pulse.ng/story/asake-lagos-concert-future-fest-2026-2026111212324356431",
    regionHint: "Lagos",
    kind: "probe",
    extractor: "future-fest-pulse",
  },
  {
    id: "iconiq-fest",
    label: "Organiser's page",
    url: "https://www.iconiqfest.com/",
    regionHint: "Lagos",
    kind: "probe",
    extractor: "iconiq-home",
  },
  {
    id: "adekunle-gold-showman-jetron",
    label: "Organiser's page",
    url: "https://www.jetronticket.com/ag-2026",
    regionHint: "Lagos",
    kind: "probe",
    extractor: "adekunle-gold-jetron",
  },
  {
    id: "afrojazz-fest",
    label: "Organiser's page",
    url: "https://afrojazzfest.org/",
    regionHint: "Lagos",
    kind: "probe",
    extractor: "afrojazz-fest-home",
  },
  {
    id: "afrofuture-residency",
    label: "Organiser's page",
    url: "https://www.afrofuture.com/",
    regionHint: "Accra",
    kind: "probe",
    extractor: "afrofuture-home",
  },
  {
    id: "zaama-disco-dailypost",
    label: "News report",
    url: "https://www.dailypost.com.gh/ghanas-2026-detty-december-concerts-festivals-and-public-holidays-confirmed/",
    regionHint: "Accra",
    kind: "probe",
    extractor: "dailypost-ghana",
  },
  {
    id: "bhim-festival",
    label: "Organiser's page",
    url: "https://bhimfestival.com/",
    regionHint: "Accra",
    kind: "probe",
    extractor: "bhim-home",
  },
  {
    id: "victony-bonfire-abuja",
    label: "Organiser's page",
    url: "https://mainlandblockparty.com/event/capital-blockparty-the-bonfire-experience",
    regionHint: "Abuja",
    kind: "probe",
    extractor: "victony-bonfire-abuja",
  },
  {
    id: "moelogo-abuja-tix",
    label: "Organiser's page",
    url: "https://tix.africa/discover/moelogo-live-in-abuja",
    regionHint: "Abuja",
    kind: "probe",
    extractor: "moelogo-abuja-tix",
  },
  {
    id: "johnny-room-live-8",
    label: "Organiser's page",
    url: "https://johnnydrille.tix.to/jrl8",
    regionHint: "Abuja",
    kind: "probe",
    extractor: "johnny-room-tix",
  },
  {
    id: "ejanla-fest-tix",
    label: "Organiser's page",
    url: "https://tix.africa/discover/ejanlafest",
    regionHint: "Abuja",
    kind: "probe",
    extractor: "ejanla-tix",
  },
  {
    id: "lol-music-fest",
    label: "Organiser's page",
    url: "https://www.lolmusicfest.com/",
    regionHint: "Abuja",
    kind: "probe",
    extractor: "lol-home",
  },
  {
    id: "alo-once-upon-a-song",
    label: "Organiser's page",
    url: "https://tix.dot360.co/event/a-lo-once-upon-a-song",
    regionHint: "Lagos",
    kind: "probe",
    extractor: "alo-dot-tix",
  },
  {
    id: "apitainment-seyi-apitix",
    label: "Organiser's page",
    url: "https://www.apitix.com/product/seyi-vibez-live-in-abuja/",
    regionHint: "Abuja",
    kind: "probe",
    extractor: "apitainment-apitix",
  },
  {
    id: "victony-bonfire-lagos",
    label: "Organiser's page",
    url: "https://mainlandblockparty.com/event/island-blockparty-the-bonfire-experience",
    regionHint: "Lagos",
    kind: "probe",
    extractor: "victony-bonfire-lagos",
  },
  // Shared probe for @abujakulture / @abujaevents December roundup events that
  // have no stronger organiser or ticket page. Several seed rows reuse this id.
  {
    id: "abujakulture-december-roundup",
    label: "Event roundup",
    url: "https://www.instagram.com/abujaevents/reel/DfUulaPsbqS/",
    regionHint: "Abuja",
    kind: "probe",
    extractor: "abujakulture-roundup",
  },
  {
    id: "dj-tunez-blackout-visitabuja",
    label: "Event listing",
    url: "https://www.visitabuja.org/event/dj-tunez-blackout-abuja/",
    regionHint: "Abuja",
    kind: "probe",
    extractor: "dj-tunez-visitabuja",
  },
  {
    id: "cavy-fest-woya",
    label: "Event listing",
    url: "https://www.woya.me/programme/abuja/event/67a10dba-b46f-478c-bc2f-75b79471c2ea",
    regionHint: "Abuja",
    kind: "probe",
    extractor: "cavy-fest-woya",
  },
] as const;

export function eventFeedById(id: string) {
  return eventFeedSources.find((source) => source.id === id) ?? null;
}
