export type Ymd = { y: number; m: number; d: number };

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function lagosYmd(now: Date): Ymd {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const num = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { y: num("year"), m: num("month"), d: num("day") };
}

export function addDays(day: Ymd, days: number): Ymd {
  const utc = new Date(Date.UTC(day.y, day.m - 1, day.d + days));
  return { y: utc.getUTCFullYear(), m: utc.getUTCMonth() + 1, d: utc.getUTCDate() };
}

function weekdayIndex(day: Ymd) {
  const utc = new Date(Date.UTC(day.y, day.m - 1, day.d, 12));
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    weekday: "short",
  }).format(utc);
  const index = weekdays.indexOf(name);
  return index === -1 ? 0 : index;
}

export function toIso(day: Ymd) {
  return `${day.y}-${String(day.m).padStart(2, "0")}-${String(day.d).padStart(2, "0")}`;
}

export type WeekWindow = { label: string; start: string; end: string; title: string };

export function weekWindows(now: Date): { thisWeek: WeekWindow; nextWeek: WeekWindow } {
  const today = lagosYmd(now);
  const sundayBased = weekdayIndex(today);
  const sinceMonday = sundayBased === 0 ? 6 : sundayBased - 1;
  const monday = addDays(today, -sinceMonday);
  const thisSunday = addDays(monday, 6);
  const nextMonday = addDays(monday, 7);
  const nextSunday = addDays(monday, 13);
  return {
    thisWeek: {
      label: "This week",
      start: toIso(monday),
      end: toIso(thisSunday),
      title: `This week, ${formatSpan(monday, thisSunday)}`,
    },
    nextWeek: {
      label: "Next week",
      start: toIso(nextMonday),
      end: toIso(nextSunday),
      title: `Next week, ${formatSpan(nextMonday, nextSunday)}`,
    },
  };
}

export function formatSpan(start: Ymd, end: Ymd) {
  const startMonth = months[start.m - 1] ?? "";
  const endMonth = months[end.m - 1] ?? "";
  if (start.y === end.y && start.m === end.m) {
    return `${start.d}–${end.d} ${startMonth} ${start.y}`;
  }
  if (start.y === end.y) {
    return `${start.d} ${startMonth}–${end.d} ${endMonth} ${start.y}`;
  }
  return `${start.d} ${startMonth} ${start.y}–${end.d} ${endMonth} ${end.y}`;
}

export function rangesOverlap(
  start: string,
  end: string,
  windowStart: string,
  windowEnd: string,
) {
  return start <= windowEnd && end >= windowStart;
}
