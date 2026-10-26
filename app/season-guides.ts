import flytimeFile from "../data/season-guides/flytime-fest-2026.json";
import visaCheckFile from "../data/season-guides/visa-check.json";
import publishedFile from "../data/event-ingest/published.json";
import { events, type CircuitEvent } from "./events";
import { flightSearches, seasonSearchNote, type FlightSearch } from "./flights";
import { rideHailMarkets } from "./ride-hailing";
import { places, type Place } from "./places";

export const SEASON_YEAR = 2026;

export type FlytimeArtist = {
  name: string;
  sourceUrl: string;
  sourceLabel: string;
  sourceId: string;
};

export type FlytimeNight = {
  id: string;
  when: string;
  name: string;
  venue: string;
  lineupIncomplete: boolean;
  artists: FlytimeArtist[];
  summaryOnFile: string;
  directorySourceId: string;
  notes: string[];
};

export type FlytimeChangelogEntry = {
  at: string;
  summary: string;
  sources: string[];
};

export type FlytimeTracker = {
  year: number;
  slug: string;
  path: string;
  title: string;
  region: string;
  venueOnFile: string;
  organiserUrl: string;
  organiserLabel: string;
  lineupStatus: string;
  statusPlain: string;
  nights: FlytimeNight[];
  changelog: FlytimeChangelogEntry[];
  howToUpdateWithinHours: string[];
};

export type VisaDestination = {
  id: string;
  country: string;
  title: string;
  officialUrl: string;
  officialLabel: string;
  httpStatusWhenChecked: number;
  purpose: string;
  eligibility: string;
  requirements: string[];
  validity?: string;
  steps?: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
  alsoNeeds?: string[];
};

export type VisaNationality = {
  slug: string;
  path: string;
  travellerLabel: string;
  passportNote: string;
};

export type VisaCheck = {
  checkedAt: string;
  checkedAtLabel: string;
  note: string;
  destinations: VisaDestination[];
  nationalityPages: VisaNationality[];
};

export type SeasonGuideMeta = {
  year: number;
  slug: string;
  path: string;
  title: string;
  description: string;
};

/** Permanent year URLs for this season — keep 2026 live when 2027 rolls. */
export const seasonGuideIndex: SeasonGuideMeta[] = [
  {
    year: SEASON_YEAR,
    slug: "flytime-fest-2026",
    path: "/events/flytime-fest-2026",
    title: "Flytime Fest 2026 lineup tracker",
    description:
      "Flytime Fest, House of R&B, and Circle lineup tracker for Lagos December 2026 — sourced artists only, with a dated changelog. Lineup incomplete where organisers have not announced headliners.",
  },
  {
    year: SEASON_YEAR,
    slug: "carnival-calabar-2026",
    path: "/guides/carnival-calabar-2026",
    title: "Carnival Calabar 2026 programme guide",
    description:
      "Official Carnival Calabar 2026 programme for diaspora travellers — peak nights and full schedule from the Cross River Carnival official materials already on file.",
  },
  {
    year: SEASON_YEAR,
    slug: "lagos-december-2026",
    path: "/guides/lagos-december-2026",
    title: "Lagos December 2026 guide",
    description:
      "Lagos Detty December 2026: confirmed events on file, flight searches into Murtala Muhammed, and Nigeria ride-app links — sourced records only.",
  },
  {
    year: SEASON_YEAR,
    slug: "accra-ghana-2026",
    path: "/guides/accra-ghana-2026",
    title: "Accra and Ghana December 2026",
    description:
      "December in Ghana 2026 from the GTA programme on file, tourism links to visitghana.com and ghana.travel, and a sourced NewsGhana section — no invented stories.",
  },
];

export function flytimeTracker(): FlytimeTracker {
  return flytimeFile as FlytimeTracker;
}

export function visaCheck(): VisaCheck {
  return visaCheckFile as VisaCheck;
}

export function visaNationality(slug: string) {
  return visaCheck().nationalityPages.find((page) => page.slug === slug) ?? null;
}

type PublishedSnapshot = {
  checkedAt?: string;
  events?: CircuitEvent[];
};

function publishedEvents(): CircuitEvent[] {
  const eventsList = (publishedFile as PublishedSnapshot).events;
  return Array.isArray(eventsList) ? eventsList : [];
}

export function carnivalPublishedCheckedAt() {
  return (publishedFile as PublishedSnapshot).checkedAt ?? null;
}

/** Peak rollup + individual official schedule nights from Carnival Calabar ingest. */
export function carnivalCalabarEvents(): CircuitEvent[] {
  const fromPublished = publishedEvents().filter(
    (event) => event.sourceId === "carnival-calabar",
  );
  if (fromPublished.length > 0) return fromPublished;
  return events.filter((event) => event.sourceId === "carnival-calabar");
}

export function carnivalPeakRollup(): CircuitEvent | null {
  return (
    carnivalCalabarEvents().find((event) => event.when === "26-30 December") ??
    null
  );
}

export function carnivalScheduleNights(): CircuitEvent[] {
  return carnivalCalabarEvents().filter((event) => event.when !== "26-30 December");
}

export function lagosEventsOnFile(): CircuitEvent[] {
  return events.filter((event) => event.region === "Lagos");
}

export function ghanaSeasonEventsOnFile(): CircuitEvent[] {
  return events.filter(
    (event) =>
      event.region === "Ghana" ||
      event.sourceId === "december-in-ghana-myjoy" ||
      /December in Ghana/i.test(event.summary),
  );
}

const lagosAirport = "Murtala Muhammed International Airport";
const accraAirport = "Accra International Airport";

export function flightsForAirport(airport: string): FlightSearch[] {
  return flightSearches.filter((flight) => flight.airport === airport);
}

export function lagosArrivalFlights(): FlightSearch[] {
  return flightsForAirport(lagosAirport);
}

export function accraArrivalFlights(): FlightSearch[] {
  return flightsForAirport(accraAirport);
}

export { seasonSearchNote };

export function nigeriaRideMarket() {
  return rideHailMarkets.find((market) => market.country === "Nigeria") ?? null;
}

export function ghanaRideMarket() {
  return rideHailMarkets.find((market) => market.country === "Ghana") ?? null;
}

function isAirport(place: Place) {
  return place.category === "Practical stops" && /airport|aéroport/i.test(place.name);
}

export function placesInCity(city: string, country: string) {
  return places.filter((place) => place.city === city && place.country === country);
}

export function lagosStayPlaces() {
  return placesInCity("Lagos", "Nigeria").filter(
    (place) => place.category === "Hotels" || place.category === "Short-stay",
  );
}

export function lagosTransportPlaces() {
  return placesInCity("Lagos", "Nigeria").filter(
    (place) => place.category === "Car rental" || isAirport(place),
  );
}

export function accraStayPlaces() {
  return placesInCity("Accra", "Ghana").filter(
    (place) => place.category === "Hotels" || place.category === "Short-stay",
  );
}

/** Official tourism outbound links for Ghana (not event inventing). */
export const ghanaTourismLinks = [
  {
    name: "Visit Ghana",
    url: "https://visitghana.com/",
    note: "Ghana tourism information site — leaves this site.",
  },
  {
    name: "Ghana.Travel",
    url: "https://ghana.travel/",
    note: "Ghana Tourism Authority travel site — leaves this site. Black Star Experience path is also on file as a probe source.",
  },
  {
    name: "Black Star Experience (ghana.travel)",
    url: "https://ghana.travel/black-star-experience",
    note: "Official Black Star Experience URL on file. Ingest has held this probe when it returned HTTP 403; season dates on the directory stay on the named MyJoyOnline GTA report until an official page states them.",
  },
  {
    name: "December in GH organiser site",
    url: "https://decemberingh.com/",
    note: "Organiser welcome page on file as a probe — does not by itself state the 2026 season dates used on this directory.",
  },
] as const;

/** NewsGhana — feed not in news-feeds.ts (Cloudflare 403 from this environment). Sourced outbound only. */
export const newsGhanaSection = {
  name: "News Ghana",
  homeUrl: "https://newsghana.com.gh/",
  feedAttempted: "https://newsghana.com.gh/feed/",
  feedStatus:
    "RSS feed URLs returned Cloudflare challenge / HTTP 403 from this environment on 26 October 2026, so headlines are not mirrored here. Open News Ghana for current stories — this page does not invent headlines.",
  relatedFeedsOnFile: [
    "https://www.adomonline.com/category/entertainment/feed/",
    "https://starrfm.com.gh/category/entertainment/feed/",
  ],
  relatedFeedsNote:
    "Ghana entertainment headlines that already appear on /news come from the public feeds listed in app/news-feeds.ts (including AdomOnline and Starr FM), not from News Ghana.",
} as const;

export const guidesHubPath = "/guides";
