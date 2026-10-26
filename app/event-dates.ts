/** Parse sourced `when` strings into ISO dates (season year 2026). Client-safe. */

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

export function eventDateSpan(when: string) {
  const dates = datesOnFile(when);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dates.startDate)) return null;
  const end =
    dates.endDate && /^\d{4}-\d{2}-\d{2}$/.test(dates.endDate)
      ? dates.endDate
      : dates.startDate;
  return { start: dates.startDate, end };
}
