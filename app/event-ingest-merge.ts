/** Pure merge helpers shared by events.ts (client-safe) and the ingest CLI. */

export type IngestEvent = {
  region: string;
  when: string;
  summary: string;
  url?: string;
  urlLabel?: string;
  ticketsUrl?: string;
  sourceId?: string;
};

export function eventKey(event: Pick<IngestEvent, "region" | "when">) {
  return `${event.region}\n${event.when}`;
}

/**
 * Merge curated seed events with the latest ingest snapshot.
 * Ingest updates matching region+when when the snapshot has a complete row.
 * Seed rows with no ingest match stay as-is (never deleted by a failed fetch).
 * Brand-new ingest keys are appended only when published by ingest.
 */
export function mergeSeedWithIngest<T extends IngestEvent>(
  seed: T[],
  ingested: IngestEvent[],
): T[] {
  const byKey = new Map<string, IngestEvent>();
  for (const row of seed) byKey.set(eventKey(row), { ...row });
  for (const row of ingested) {
    const key = eventKey(row);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...row });
      continue;
    }
    const next: IngestEvent = {
      ...existing,
      summary: row.summary,
      url: row.url ?? existing.url,
      urlLabel: row.urlLabel ?? existing.urlLabel,
      sourceId: row.sourceId ?? existing.sourceId,
    };
    if (row.ticketsUrl) next.ticketsUrl = row.ticketsUrl;
    else if (existing.ticketsUrl) next.ticketsUrl = existing.ticketsUrl;
    byKey.set(key, next);
  }
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of seed) {
    const key = eventKey(row);
    out.push(byKey.get(key)! as T);
    seen.add(key);
  }
  for (const row of ingested) {
    const key = eventKey(row);
    if (seen.has(key)) continue;
    out.push(byKey.get(key)! as T);
    seen.add(key);
  }
  return out;
}
