import { eventDateSpan } from "./event-dates";
import type { CircuitEvent } from "./events";
import { presentEvent } from "./event-view";
import { absoluteUrl } from "./site";

export type CalendarLinks = {
  /** Google Calendar template URL — all-day from sourced dates only. */
  googleUrl: string;
  /** ICS body for download — VALUE=DATE, no invented clock times. */
  ics: string;
  /** Suggested download filename. */
  icsFilename: string;
};

function yyyymmdd(iso: string) {
  return iso.replace(/-/g, "");
}

/** Exclusive end date for all-day Google / ICS (day after last inclusive day). */
function dayAfter(iso: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + 1));
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function icsEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Build calendar links from sourced `when` only. Returns null when dates
 * cannot be parsed — never invents a start time.
 */
export function calendarLinksFor(event: CircuitEvent): CalendarLinks | null {
  const span = eventDateSpan(event.when);
  if (!span) return null;
  const endExclusive = dayAfter(span.end);
  if (!endExclusive) return null;

  const view = presentEvent(event);
  const pageUrl = absoluteUrl(view.href);
  const details = [event.summary, pageUrl].filter(Boolean).join("\n");
  const location = [view.venue, view.region].filter(Boolean).join(", ");

  const google = new URL("https://calendar.google.com/calendar/render");
  google.searchParams.set("action", "TEMPLATE");
  google.searchParams.set("text", view.name);
  google.searchParams.set(
    "dates",
    `${yyyymmdd(span.start)}/${yyyymmdd(endExclusive)}`,
  );
  google.searchParams.set("details", details);
  if (location) google.searchParams.set("location", location);
  google.searchParams.set("ctz", "Africa/Lagos");

  // Stable stamp from sourced start date — avoids prerender `new Date()` (Next cacheComponents).
  const stamp = `${yyyymmdd(span.start)}T000000Z`;
  const uid = `${view.slug}@dirtydecember.info`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//dirtydecember.info//events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${yyyymmdd(span.start)}`,
    `DTEND;VALUE=DATE:${yyyymmdd(endExclusive)}`,
    `SUMMARY:${icsEscape(view.name)}`,
    `DESCRIPTION:${icsEscape(details)}`,
    location ? `LOCATION:${icsEscape(location)}` : null,
    `URL:${pageUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter((line): line is string => Boolean(line))
    .join("\r\n");

  return {
    googleUrl: google.toString(),
    ics,
    icsFilename: `${view.slug}.ics`,
  };
}
