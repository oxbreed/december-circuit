/** Parse sourced `when` strings into ISO dates (Detty December season). Client-safe. */

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

/** December-season year for date strings that omit a year (e.g. "20 December"). */
export const seasonYear = 2026;

/**
 * Months Jan–Mar without an explicit year belong to the January after the
 * December season (2027 for season 2026), matching Carnival / Ghana calendars.
 */
function yearForMonth(month: string, explicitYear?: string) {
  if (explicitYear) return explicitYear;
  const n = monthNumbers[month.toLowerCase()];
  if (n && Number(n) <= 3) return String(seasonYear + 1);
  return String(seasonYear);
}

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
    const year = yearForMonth(range[3]);
    return {
      startDate: isoDate(range[1], range[3], year),
      endDate: isoDate(range[2], range[3], year),
    };
  }

  const day = when.match(/^(\d{1,2}) ([A-Za-z]+)$/);
  if (day) {
    const startDate = isoDate(day[1], day[2], yearForMonth(day[2]));
    return { startDate, endDate: startDate };
  }

  return { startDate: when };
}

export function eventDateSpan(when: string) {
  const dates = datesOnFile(when);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dates.startDate)) return null;
  const end =
    dates.endDate && /^\d{4}-\d{2}-\d{2}$/.test(dates.endDate)
      ? dates.endDate
      : dates.startDate;
  return { start: dates.startDate, end };
}

/** Full weekday + date + year from sourced `when` only (no invented clock times). */
export function fullEventDateLabel(when: string): string {
  const span = eventDateSpan(when);
  if (!span) return when;
  const startLabel = weekdayDateLabel(span.start);
  if (!startLabel) return when;
  if (span.end === span.start) return startLabel;
  const endLabel = weekdayDateLabel(span.end);
  if (!endLabel) return startLabel;
  return `${startLabel} – ${endLabel}`;
}

function weekdayDateLabel(iso: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(utc);
}

/** Ensure a human `when` slug token includes the season year when missing. */
export function whenSlugWithYear(when: string): string {
  const dates = datesOnFile(when);
  const startYear = /^\d{4}-\d{2}-\d{2}$/.test(dates.startDate)
    ? dates.startDate.slice(0, 4)
    : String(seasonYear);
  if (/\b20\d{2}\b/.test(when)) {
    return slugifyToken(when);
  }
  return slugifyToken(`${when} ${startYear}`);
}

function slugifyToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
