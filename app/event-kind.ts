/**
 * Editorial kinds derived only from words already present in sourced summaries.
 * Events without a matching keyword stay uncategorized — never invent a type.
 */
export const eventKinds = ["Concert", "Festival", "Carnival", "Exhibition"] as const;

export type EventKind = (typeof eventKinds)[number];

export function eventKind(event: { summary: string }): EventKind | null {
  const text = event.summary.toLowerCase();

  if (/\bcarnival\b/.test(text)) return "Carnival";
  if (/\bexhibition\b/.test(text)) return "Exhibition";
  if (/\bfestival\b|\bfest\b/.test(text)) return "Festival";
  if (
    /\bconcert\b|\bresidency\b|\bunplugged\b|\bhouse of r&b\b|\bhouse of r and b\b/.test(
      text,
    )
  ) {
    return "Concert";
  }

  return null;
}

export function kindsPresentIn(rows: { summary: string }[]): EventKind[] {
  const found = new Set<EventKind>();
  for (const row of rows) {
    const kind = eventKind(row);
    if (kind) found.add(kind);
  }
  return eventKinds.filter((kind) => found.has(kind));
}
