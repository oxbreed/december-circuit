import { faqAnswerPlain, faqItems } from "./faq-items";
import { presentEvent } from "./event-view";
import type { CircuitEvent } from "./events";
import type { CityRecord } from "./cities";
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

export function cityPlaceJsonLd(city: CityRecord) {
  const pageUrl = absoluteUrl(`/cities/${city.slug}`);
  return {
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

export function eventJsonLd(event: CircuitEvent) {
  const view = presentEvent(event);
  const dates = datesOnFile(event.when);
  const city = places.find((item) => item.city === event.region);
  const address: Record<string, string> = { "@type": "PostalAddress" };
  if (city) {
    address.addressLocality = city.city;
    address.addressCountry = city.country;
  } else {
    address.addressCountry = event.region;
  }

  const location: Record<string, unknown> = {
    "@type": "Place",
    address,
  };
  if (view.venue) location.name = view.venue;

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
