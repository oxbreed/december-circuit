/**
 * Tier-1 / official / named sources already used on the directory.
 * Ingest only fetches this allowlist. Entertainment RSS (news-feeds.ts) is not
 * an event publisher.
 */
export type EventFeedLabel = "Organiser's page" | "Official page" | "News report";

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
] as const;

export function eventFeedById(id: string) {
  return eventFeedSources.find((source) => source.id === id) ?? null;
}
