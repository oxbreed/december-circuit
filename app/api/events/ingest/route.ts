import lastRun from "../../../../data/event-ingest/last-run.json";
import { EVENT_INGEST_CADENCE_DAYS, eventFeedSources } from "../../../event-feeds";

/**
 * Read-only status of the last Tier-1 event ingest.
 * Run `npm run ingest:events` to refresh (3-day cadence). Does not fetch live.
 */
export async function GET() {
  const checkedAt =
    typeof (lastRun as { checkedAt?: string | null }).checkedAt === "string"
      ? (lastRun as { checkedAt: string }).checkedAt
      : null;
  const published = Array.isArray((lastRun as { published?: unknown }).published)
    ? (lastRun as { published: unknown[] }).published.length
    : 0;
  const held = Array.isArray((lastRun as { held?: unknown }).held)
    ? (lastRun as { held: unknown[] }).held.length
    : 0;

  return Response.json({
    cadenceDays: EVENT_INGEST_CADENCE_DAYS,
    checkedAt,
    published,
    held,
    allowlistedSources: eventFeedSources.map((source) => ({
      id: source.id,
      label: source.label,
      url: source.url,
      regionHint: source.regionHint,
      kind: source.kind,
    })),
    message: checkedAt
      ? "Last ingest snapshot on disk. Public events merge seed + published.json."
      : "No ingest has been run yet. Seed events.ts rows still power the directory.",
  });
}
