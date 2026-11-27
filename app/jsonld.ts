import type { CityRecord } from "./cities";
import type { CountryRecord } from "./countries";
import { faqAnswerPlain, faqItems } from "./faq-items";
import { presentEvent } from "./event-view";
import type { CircuitEvent } from "./events";
import { pinForName, pinsInCity } from "./geo";
import type { Pin } from "./pins";
import type { Place } from "./places";
import { places } from "./places";
import {
  placeDescription,
  type PlaceRecord,
} from "./place-catalog";
import {
  absoluteUrl,
  defaultDescription,
  publisherName,
  publisherUrl,
  siteName,
  siteUrl,
} from "./site";
import { shareImageForEvent } from "./share-images";

import { datesOnFile } from "./event-dates";
import {
  offersFor,
  organizerFor,
  performersFor,
  startDateWithTime,
} from "./event-seo";

export { datesOnFile };

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    legalName: publisherName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/apple-icon.png"),
      width: 180,
      height: 180,
    },
    email: "hello@dirtydecember.info",
    parentOrganization: {
      "@type": "Organization",
      name: publisherName,
      url: publisherUrl,
    },
    sameAs: [publisherUrl],
  };
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    alternateName: "Dirty December",
    url: siteUrl,
    description: defaultDescription,
    inLanguage: "en",
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": absoluteUrl("/faq"),
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faqAnswerPlain(item.answer),
      },
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function geoFromPin(pin: Pin) {
  return {
    "@type": "GeoCoordinates",
    latitude: pin.latitude,
    longitude: pin.longitude,
  };
}

export function placeJsonLdFromPin(pin: Pin) {
  const data: Record<string, unknown> = {
    "@type": "Place",
    name: pin.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: pin.city,
      addressCountry: pin.country,
    },
    geo: geoFromPin(pin),
  };
  if (pin.url) data.sameAs = pin.url;
  return data;
}

export function cityPlaceJsonLd(city: CityRecord) {
  const pageUrl = absoluteUrl(`/cities/${city.slug}`);
  const cityPins = pinsInCity(city.city, city.country);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "@id": pageUrl,
    name: `${city.city}, ${city.country}`,
    url: pageUrl,
    description: `${city.city}, ${city.country} on dirtydecember.info — organiser pages and confirmed December events already on file.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: city.city,
      addressCountry: city.country,
    },
    containedInPlace: {
      "@type": "Place",
      name: "West Africa",
    },
  };
  if (cityPins.length > 0) {
    data.geo = geoFromPin(cityPins[0]);
  }
  return data;
}

/** Places on a city page that have a matching sourced pin (coordinates only when matched). */
export function cityPlacesItemListJsonLd(city: CityRecord) {
  const matched: { place: Place; pin: Pin }[] = [];
  for (const place of city.places) {
    const pin = pinForName(city.city, place.name);
    if (pin) matched.push({ place, pin });
  }
  if (matched.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Sourced places in ${city.city}`,
    numberOfItems: matched.length,
    itemListElement: matched.map(({ place, pin }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        ...placeJsonLdFromPin(pin),
        name: place.name,
        url: place.url || pin.url,
      },
    })),
  };
}

export function citiesItemListJsonLd(
  cities: { city: string; country: string; slug: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cities on dirtydecember.info",
    itemListElement: cities.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${city.city}, ${city.country}`,
      url: absoluteUrl(`/cities/${city.slug}`),
    })),
  };
}

export function countryJsonLd(country: CountryRecord) {
  const pageUrl = absoluteUrl(`/countries/${country.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "@id": pageUrl,
    name: country.country,
    url: pageUrl,
    description: `${country.country} — cities, organiser pages, and confirmed December events on dirtydecember.info.`,
    containedInPlace: {
      "@type": "Place",
      name: "West Africa",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: country.country,
    },
  };
}

export function countryCitiesItemListJsonLd(country: CountryRecord) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Cities in ${country.country} on dirtydecember.info`,
    itemListElement: country.cities.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: city.city,
      url: absoluteUrl(`/cities/${city.slug}`),
    })),
  };
}

export function eventsItemListJsonLd(
  listed: CircuitEvent[],
  name: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: listed.map((event, index) => {
      const view = presentEvent(event);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: view.name,
        url: absoluteUrl(view.href),
      };
    }),
  };
}

const placeSchemaType: Record<string, string> = {
  Hotels: "Hotel",
  "Short-stay": "LodgingBusiness",
  "Beach resorts": "Resort",
  Restaurants: "Restaurant",
  Catering: "FoodEstablishment",
  Clubs: "NightClub",
  Bars: "BarOrPub",
  Beaches: "Beach",
  Cinemas: "MovieTheater",
  Landmarks: "LandmarksOrHistoricalBuildings",
  "Event centres": "EventVenue",
  "Recreation centres": "SportsActivityLocation",
  "Boat clubs": "SportsActivityLocation",
  "Car rental": "AutoRental",
  "Practical stops": "TouristAttraction",
};

export function listedPlaceJsonLd(place: PlaceRecord) {
  const pageUrl = absoluteUrl(`/place/${place.slug}`);
  const pin = pinForName(place.city, place.name);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":
      /airport|aéroport/i.test(place.name) && place.category === "Practical stops"
        ? "Airport"
        : (placeSchemaType[place.category] ?? "Place"),
    "@id": pageUrl,
    name: place.name,
    url: pageUrl,
    description: placeDescription(place),
    address: {
      "@type": "PostalAddress",
      ...(place.area ? { streetAddress: place.area } : {}),
      addressLocality: place.city,
      addressCountry: place.country,
    },
    sameAs: place.url,
  };
  if (pin) data.geo = geoFromPin(pin);
  return data;
}

export function categoryPlacesItemListJsonLd(
  category: string,
  categoryPath: string,
  listed: PlaceRecord[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category} on dirtydecember.info`,
    url: absoluteUrl(categoryPath),
    mainEntity: {
      "@type": "ItemList",
      name: category,
      numberOfItems: listed.length,
      itemListElement: listed.map((place, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: place.name,
        url: absoluteUrl(`/place/${place.slug}`),
      })),
    },
  };
}

export function webPageJsonLd({
  path,
  name,
  description,
}: {
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl(path),
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: {
      "@type": "Place",
      name: "West Africa",
    },
  };
}

export function eventJsonLd(event: CircuitEvent) {
  const view = presentEvent(event);
  const timed = startDateWithTime(event);
  const cityRow = places.find((item) => item.city === event.region);
  const address: Record<string, string> = { "@type": "PostalAddress" };
  if (cityRow) {
    address.addressLocality = cityRow.city;
    address.addressCountry = cityRow.country;
  } else if (event.region === "Ghana") {
    // Season hub row — country only; no invented Accra venue.
    address.addressCountry = "Ghana";
  } else {
    address.addressLocality = event.region;
  }

  const location: Record<string, unknown> = {
    "@type": "Place",
    address,
  };
  if (view.venue) location.name = view.venue;
  else location.name = event.region;

  const pin = pinForName(event.region, view.venue);
  if (pin) {
    location.geo = geoFromPin(pin);
    if (pin.url) location.sameAs = pin.url;
  }

  const pageUrl = absoluteUrl(view.href);
  const share = shareImageForEvent(event);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": pageUrl,
    name: view.name,
    description: event.summary,
    startDate: timed.startDate,
    url: pageUrl,
    image: [absoluteUrl(share.url)],
    location,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: "en",
  };
  if (timed.endDate) data.endDate = timed.endDate;
  const organizer = organizerFor(event);
  if (organizer) data.organizer = { "@type": "Organization", ...organizer };
  const performers = performersFor(event);
  if (performers.length > 0) {
    data.performer = performers.map((name) => ({ "@type": "PerformingGroup", name }));
  }
  // Ticket link only; price appears only when the summary states one.
  const offers = offersFor(event);
  if (offers) data.offers = offers;
  if (event.url) data.sameAs = event.ticketsUrl ?? event.url;
  return data;
}


function markdownToPlain(value: string) {
  return value
    .replace(/\[([^\]]+)\](\([^)]+\))/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function articleJsonLd({
  path,
  headline,
  description,
  image,
  datePublished,
  dateModified,
}: {
  path: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
}) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline,
    description,
    datePublished,
    dateModified: dateModified ?? datePublished,
    url,
    mainEntityOfPage: url,
    inLanguage: "en",
    image: [absoluteUrl(image)],
    author: {
      "@type": "Organization",
      name: publisherName,
      url: publisherUrl,
    },
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function faqPageJsonLdFor(
  path: string,
  items: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: markdownToPlain(item.answer),
      },
    })),
  };
}
