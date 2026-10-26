import { events, type CircuitEvent } from "./events";

/**
 * Major season headlines only — resolved from existing sourced rows by sourceId
 * (and when needed, a specific when). Never invents events.
 * Shared by home FeaturedSeason and /events major cards.
 */
export const majorEventKeys: ReadonlyArray<{ sourceId: string; when?: string }> = [
  { sourceId: "oriade-residency" },
  { sourceId: "detty-december-fest" },
  { sourceId: "flytime-fest-home", when: "22-24 December" },
  { sourceId: "rhythm-unplugged-stylerave" },
  { sourceId: "carnival-calabar", when: "26-30 December" },
  { sourceId: "december-in-ghana-myjoy" },
];

export function majorEventsFrom(rows: CircuitEvent[]): CircuitEvent[] {
  const out: CircuitEvent[] = [];
  for (const key of majorEventKeys) {
    const match = rows.find(
      (event) =>
        event.sourceId === key.sourceId &&
        (key.when === undefined || event.when === key.when),
    );
    if (match) out.push(match);
  }
  return out;
}

export function majorEvents(): CircuitEvent[] {
  return majorEventsFrom(events);
}

export function isMajorEvent(event: CircuitEvent, majors = majorEventsFrom(events)) {
  return majors.some(
    (major) =>
      major.region === event.region &&
      major.when === event.when &&
      major.summary === event.summary,
  );
}
