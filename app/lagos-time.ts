const ZONE = "Africa/Lagos";

export type LagosStamp = {
  iso: string;
  clock: string;
  dayPeriod: string;
  weekday: string;
  date: string;
};

function pick(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function lagosStamp(now: Date): LagosStamp {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).formatToParts(now);

  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).formatToParts(now);

  const isoParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const hour = pick(time, "hour").trim().padStart(2, "0");
  const minute = pick(time, "minute").trim();
  const second = pick(time, "second").trim();
  const dayPeriod = pick(time, "dayPeriod").replace(/\./g, "").trim().toUpperCase();
  let isoHour = pick(isoParts, "hour").trim();
  if (isoHour === "24") isoHour = "00";

  return {
    iso: `${pick(isoParts, "year")}-${pick(isoParts, "month")}-${pick(isoParts, "day")}T${isoHour}:${pick(isoParts, "minute")}:${pick(isoParts, "second")}+01:00`,
    clock: `${hour}:${minute}:${second}`,
    dayPeriod,
    weekday: pick(day, "weekday"),
    date: `${pick(day, "day")} ${pick(day, "month")}`,
  };
}
