import type { CircuitEvent } from "./events";

export const eventCategory = "Confirmed event";

export function eventSlug(event: Pick<CircuitEvent, "region" | "when">) {
  return `${event.region}-${event.when}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const atThe = " at the ";
const eko = ", Eko Convention Centre";

export function eventNameAndVenue(summary: string) {
  const at = summary.indexOf(atThe);
  if (at !== -1) {
    return {
      name: summary.slice(0, at).replace(/,\s*$/, ""),
      venue: summary.slice(at + atThe.length).replace(/\.$/, ""),
    };
  }

  const centre = summary.indexOf(eko);
  if (centre !== -1) {
    return {
      name: summary.slice(0, centre),
      venue: "Eko Convention Centre",
    };
  }

  const sentence = summary.split(". ")[0]?.replace(/\.$/, "") ?? summary;
  return { name: sentence, venue: null };
}

export type DateFace =
  | { kind: "single"; month: string; day: string }
  | { kind: "range"; month: string; day: string }
  | {
      kind: "span";
      fromDay: string;
      fromMonth: string;
      fromYear: string;
      toDay: string;
      toMonth: string;
      toYear: string;
    }
  | { kind: "text"; text: string };

export function dateFace(when: string): DateFace {
  const span = when.match(
    /^(\d{1,2}) ([A-Za-z]+) (\d{4}) to (\d{1,2}) ([A-Za-z]+) (\d{4})$/,
  );
  if (span) {
    return {
      kind: "span",
      fromDay: span[1],
      fromMonth: span[2].slice(0, 3).toUpperCase(),
      fromYear: span[3],
      toDay: span[4],
      toMonth: span[5].slice(0, 3).toUpperCase(),
      toYear: span[6],
    };
  }

  const range = when.match(/^(\d{1,2})-(\d{1,2}) ([A-Za-z]+)$/);
  if (range) {
    return {
      kind: "range",
      day: `${range[1]}–${range[2]}`,
      month: range[3].slice(0, 3).toUpperCase(),
    };
  }

  const single = when.match(/^(\d{1,2}) ([A-Za-z]+)$/);
  if (single) {
    return {
      kind: "single",
      day: single[1],
      month: single[2].slice(0, 3).toUpperCase(),
    };
  }

  return { kind: "text", text: when };
}

export function eventNote(summary: string, name: string, venue: string | null) {
  let rest = summary;
  if (rest.startsWith(name)) rest = rest.slice(name.length);
  rest = rest.replace(/^[,.\s]+/, "");
  if (venue && rest.startsWith(`at the ${venue}`)) {
    rest = rest.slice(`at the ${venue}`.length);
  } else if (venue && rest.startsWith(venue)) {
    rest = rest.slice(venue.length);
  }
  rest = rest.replace(/^[,.\s]+/, "").trim();
  return rest.length > 0 ? rest : null;
}

export function presentEvent(event: CircuitEvent) {
  const { name, venue } = eventNameAndVenue(event.summary);
  return {
    slug: eventSlug(event),
    name,
    venue,
    note: eventNote(event.summary, name, venue),
    category: eventCategory,
    region: event.region,
    when: event.when,
    summary: event.summary,
    href: `/events/${eventSlug(event)}`,
  };
}

const planCheckDate = "23 October 2026";

const openedSources = new Set([
  "https://www.dmwhq.com/residency",
  "https://dettydecfest.com/",
  "https://www.stylerave.com/rhythm-unplugged-2026-headliners/",
  "https://www.carnival.crossriverstate.gov.ng/",
]);

export function checkedOn(event: Pick<CircuitEvent, "url">) {
  if (!event.url || !openedSources.has(event.url)) return null;
  return `Checked ${planCheckDate}`;
}

export function eventsInRegionOrder<T extends { region: string }>(rows: T[]) {
  const rank = (region: string) => (region === "Lagos" ? 0 : region === "Calabar" ? 1 : 2);
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => rank(a.row.region) - rank(b.row.region) || a.index - b.index)
    .map((item) => item.row);
}
