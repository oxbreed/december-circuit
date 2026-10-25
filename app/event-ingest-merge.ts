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

/** Stable identity — includes summary so same-day Carnival nights stay distinct. */
export function eventKey(
  event: Pick<IngestEvent, "region" | "when" | "summary">,
) {
  return `${event.region}\n${event.when}\n${event.summary}`;
}

export function regionWhenKey(event: Pick<IngestEvent, "region" | "when">) {
  return `${event.region}\n${event.when}`;
}

function overlayIngest(existing: IngestEvent, row: IngestEvent): IngestEvent {
  const next: IngestEvent = {
    ...existing,
    summary: row.summary,
    url: row.url ?? existing.url,
    urlLabel: row.urlLabel ?? existing.urlLabel,
    sourceId: row.sourceId ?? existing.sourceId,
  };
  if (row.ticketsUrl) next.ticketsUrl = row.ticketsUrl;
  else if (existing.ticketsUrl) next.ticketsUrl = existing.ticketsUrl;
  return next;
}

/**
 * Merge curated seed events with the latest ingest snapshot.
 * Exact region+when+summary matches update in place. When ingest refreshes a
 * single seed night (same region+when + sourceId) and that slot is still the
 * only out-row for that pair, update the seed. Never collapse multiple ingest
 * rows that share a day (Carnival schedule). Brand-new ingest keys append.
 */
export function mergeSeedWithIngest<T extends IngestEvent>(
  seed: T[],
  ingested: IngestEvent[],
): T[] {
  const out: IngestEvent[] = seed.map((row) => ({ ...row }));
  // Seed region+when+sourceId pairs that are unique in the seed list.
  const uniqueSeedSlot = new Map<string, number>();
  seed.forEach((row, index) => {
    if (!row.sourceId) return;
    const slot = `${regionWhenKey(row)}\n${row.sourceId}`;
    if (uniqueSeedSlot.has(slot)) uniqueSeedSlot.set(slot, -1);
    else uniqueSeedSlot.set(slot, index);
  });

  for (const row of ingested) {
    const exact = out.findIndex((item) => eventKey(item) === eventKey(row));
    if (exact !== -1) {
      out[exact] = overlayIngest(out[exact], row);
      continue;
    }

    if (row.sourceId) {
      const slot = `${regionWhenKey(row)}\n${row.sourceId}`;
      const seedIndex = uniqueSeedSlot.get(slot);
      if (seedIndex !== undefined && seedIndex >= 0) {
        // Still the original seed identity (summary may already have been refreshed).
        const currentKey = eventKey(out[seedIndex]);
        const stillSeedSlot =
          out.filter(
            (item) =>
              regionWhenKey(item) === regionWhenKey(row) &&
              item.sourceId === row.sourceId,
          ).length === 1;
        if (stillSeedSlot && out[seedIndex] && eventKey(out[seedIndex]) === currentKey) {
          out[seedIndex] = overlayIngest(out[seedIndex], row);
          continue;
        }
      }
    }

    out.push({ ...row });
  }

  return out as T[];
}
