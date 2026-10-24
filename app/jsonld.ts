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
  absoluteUrl,
  defaultDescription,
  publisherName,
  publisherUrl,
  siteName,
  siteUrl,
} from "./site";

const monthNumbers: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

const seasonYear = "2026";

function isoDate(day: string, month: string, year: string) {
  const monthNumber = monthNumbers[month.toLowerCase()];
  if (!monthNumber) return `${day} ${month} ${year}`;
  return `${year}-${monthNumber}-${day.padStart(2, "0")}`;
}

export function datesOnFile(when: string): { startDate: string; endDate?: string } {
  const span = when.match(
    /^(\d{1,2}) ([A-Za-z]+) (\d{4}) to (\d{1,2}) ([A-Za-z]+) (\d{4})$/,
  );
  if (span) {
    return {
      startDate: isoDate(span[1], span[2], span[3]),
      endDate: isoDate(span[4], span[5], span[6]),
    };
  }

  const range = when.match(/^(\d{1,2})-(\d{1,2}) ([A-Za-z]+)$/);
  if (range) {
    return {
      startDate: isoDate(range[1], range[3], seasonYear),
      endDate: isoDate(range[2], range[3], seasonYear),
    };
  }

  const day = when.match(/^(\d{1,2}) ([A-Za-z]+)$/);
  if (day) {
    const startDate = isoDate(day[1], day[2], seasonYear);
    return { startDate, endDate: startDate };
  }

  return { startDate: when };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: publisherName,
    url: publisherUrl,
    brand: {
      "@type": "Brand",
      name: siteName,
      url: siteUrl,
    },
    email: "hello@dirtydecember.info",
  };
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    description: defaultDescription,
    inLanguage: "en",
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/events?date={search_term_string}`,
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

export function eventJsonLd(event: CircuitEvent) {
  const view = presentEvent(event);
  const dates = datesOnFile(event.when);
  const cityRow = places.find((item) => item.city === event.region);
  const address: Record<string, string> = { "@type": "PostalAddress" };
  if (cityRow) {
    address.addressLocality = cityRow.city;
    address.addressCountry = cityRow.country;
  } else {
    address.addressCountry = event.region;
  }

  const location: Record<string, unknown> = {
    "@type": "Place",
    address,
  };
  if (view.venue) location.name = view.venue;

  const pin = pinForName(event.region, view.venue);
  if (pin) {
    location.geo = geoFromPin(pin);
    if (pin.url) location.sameAs = pin.url;
  }

  const pageUrl = absoluteUrl(view.href);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": pageUrl,
    name: view.name,
    description: event.summary,
    startDate: dates.startDate,
    url: pageUrl,
    location,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: "en",
  };
  if (dates.endDate) data.endDate = dates.endDate;
  if (event.url && event.urlLabel !== "News report") {
    data.organizer = {
      "@type": "Organization",
      url: event.url,
    };
  }
  if (event.ticketsUrl) {
    // Outbound ticket link only — no price, fare, or availability claim on this site.
    data.sameAs = event.ticketsUrl;
  }
  return data;
}
