import { presentEvent } from "./event-view";
import type { CircuitEvent } from "./events";
import { places } from "./places";
import { absoluteUrl, defaultDescription, publisherName, siteName, siteUrl } from "./site";

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

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: defaultDescription,
    publisher: {
      "@type": "Organization",
      name: publisherName,
    },
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
    startDate: dates.startDate,
    url: pageUrl,
    location,
  };
  if (dates.endDate) data.endDate = dates.endDate;
  if (event.url) {
    data.organizer = {
      "@type": "Organization",
      url: event.url,
    };
  }
  if (event.ticketsUrl) data.sameAs = event.ticketsUrl;
  return data;
}
