#!/usr/bin/env node
/**
 * Tier-1 event ingest CLI. Cadence: every 3 days (see preferences / event-feed-ingest.md).
 *
 *   npm run ingest:events
 *
 * Writes data/event-ingest/{published,held,last-run}.json
 * Home, /events, and GET /api/events pick up published rows via app/events.ts.
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  runEventIngest,
  writeIngestSnapshot,
} from "../app/event-ingest";

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const report = await runEventIngest();
  const dir = writeIngestSnapshot(root, report);

  console.log(`Checked ${report.checkedAt}`);
  console.log(`Cadence ${report.cadenceDays} days`);
  console.log(`Wrote ${dir}`);
  console.log(`Published ${report.published.length} · held ${report.held.length}`);
  for (const source of report.sources) {
    const mark = source.ok ? "ok" : "fail";
    console.log(
      `  [${mark}] ${source.id}: ${source.detail} (published ${source.published}, held ${source.held})`,
    );
  }
  for (const row of report.published) {
    console.log(`  + ${row.region} · ${row.when} · ${row.sourceId ?? "?"}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
