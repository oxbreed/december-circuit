/**
 * Automated Tier-1 event ingest for DirtyDecember.
 * Fetches only allowlisted sources in event-feeds.ts. Never invents dates,
 * prices, fares, or booking URLs. Incomplete or ambiguous items are held.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  EVENT_INGEST_CADENCE_DAYS,
  eventFeedSources,
  type EventFeedSource,
} from "./event-feeds";
import { eventKey, type IngestEvent } from "./event-ingest-merge";

export type { IngestEvent } from "./event-ingest-merge";
export { eventKey, mergeSeedWithIngest } from "./event-ingest-merge";

export type HeldCandidate = {
  sourceId: string;
  url: string;
  urlLabel: string;
  region?: string;
  when?: string;
  summary?: string;
  ticketsUrl?: string;
  holdReason: string;
};

export type SourceRun = {
  id: string;
  url: string;
  ok: boolean;
  detail: string;
  published: number;
  held: number;
};

export type IngestReport = {
  checkedAt: string;
  cadenceDays: number;
  sources: SourceRun[];
  published: IngestEvent[];
  held: HeldCandidate[];
};

export type IngestSnapshot = {
  checkedAt: string;
  cadenceDays: number;
  published: IngestEvent[];
  held: HeldCandidate[];
  sources: SourceRun[];
};

const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT = "DecemberCircuitEventIngest/1.0 (+https://dirtydecember.info)";

function decodeEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#8217;|&rsquo;|&#39;/gi, "'")
    .replace(/&#8211;|&ndash;/gi, "–")
    .replace(/&#8212;|&mdash;/gi, "—")
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    );
}

function htmlToText(html: string) {
  const without = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(without).replace(/\s+/g, " ").trim();
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      accept: "text/html,application/xhtml+xml,application/javascript,text/javascript,*/*",
      "user-agent": USER_AGENT,
    },
    redirect: "follow",
  });
  if (!response.ok) {
    return { ok: false as const, status: response.status, body: "" };
  }
  return { ok: true as const, status: response.status, body: await response.text() };
}

type ExtractResult = {
  published: IngestEvent[];
  held: HeldCandidate[];
  detail: string;
};

function hold(
  source: EventFeedSource,
  reason: string,
  partial?: Partial<HeldCandidate>,
): HeldCandidate {
  return {
    sourceId: source.id,
    url: source.url,
    urlLabel: source.label,
    region: partial?.region ?? source.regionHint,
    when: partial?.when,
    summary: partial?.summary,
    ticketsUrl: partial?.ticketsUrl,
    holdReason: reason,
  };
}

function publish(
  source: EventFeedSource,
  fields: {
    region: string;
    when: string;
    summary: string;
    ticketsUrl?: string;
    url?: string;
  },
): IngestEvent {
  const row: IngestEvent = {
    region: fields.region,
    when: fields.when,
    summary: fields.summary,
    url: fields.url ?? source.url,
    urlLabel: source.label,
    sourceId: source.id,
  };
  if (fields.ticketsUrl) row.ticketsUrl = fields.ticketsUrl;
  return row;
}

function extractOriade(
  source: EventFeedSource,
  text: string,
  rawHtml: string,
): ExtractResult {
  const hasDates =
    /DEC\s*17(?:TH)?/i.test(text) &&
    /DEC\s*18(?:TH)?/i.test(text) &&
    /DEC\s*19(?:TH)?/i.test(text);
  const hasVenue = /National Theatre/i.test(text);
  const hasName = /Oriad/i.test(text);
  // Wix keeps the artist name in page JSON inside <script>; search raw HTML too.
  const hasDavido = /Davido/i.test(text) || /Davido/i.test(rawHtml);
  if (!hasDates || !hasVenue || !hasName) {
    return {
      published: [],
      held: [
        hold(
          source,
          "Organiser page did not state all of Oriadé, Dec 17–19, and National Theatre.",
        ),
      ],
      detail: "incomplete fields",
    };
  }
  const base = hasDavido ? "Davido, Oriade residency" : "Oriade residency";
  // Only keep Iganmu when the opened page states it.
  const summary = /Iganmu/i.test(text) || /Iganmu/i.test(rawHtml)
    ? `${base}, three nights at the National Theatre, Iganmu.`
    : `${base}, three nights at the National Theatre.`;
  return {
    published: [
      publish(source, {
        region: "Lagos",
        when: "17-19 December",
        summary,
      }),
    ],
    held: [],
    detail: "Oriade residency confirmed",
  };
}

function extractDettyFest(source: EventFeedSource, text: string): ExtractResult {
  const hasWindow =
    /18\s*[-–—]\s*30\s*December\s*2026/i.test(text) ||
    /18-30 December 2026/i.test(text) ||
    /DEC\s*18\s*[-–—]\s*30/i.test(text);
  const hasName = /Detty December Fest/i.test(text);
  const hasLagos = /Lagos/i.test(text);
  if (!hasWindow || !hasName || !hasLagos) {
    return {
      published: [],
      held: [
        hold(
          source,
          "Organiser page did not state Detty December Fest, 18–30 December 2026, Lagos.",
        ),
      ],
      detail: "incomplete fields",
    };
  }

  const nights: string[] = [];
  if (/Wizkid/i.test(text)) nights.push("Wizkid on 18 December");
  if (/DJ Tunez/i.test(text)) {
    nights.push(
      /Friends/i.test(text)
        ? "DJ Tunez and Friends on 24 December"
        : "DJ Tunez on 24 December",
    );
  }
  if (/Tungba/i.test(text)) nights.push("Tungba Christmas on 25 December");

  let summary = "Detty December Fest.";
  if (nights.length) summary += ` ${nights.join(", ")}.`;
  if (/coming soon/i.test(text)) {
    summary += " Other nights are still marked coming soon.";
  }

  return {
    published: [
      publish(source, {
        region: "Lagos",
        when: "18-30 December",
        summary,
        ticketsUrl: "https://tix.dot360.co/org/livespot/detty-december",
      }),
    ],
    held: [],
    detail: "Detty December Fest window confirmed",
  };
}

function extractDettyTickets(source: EventFeedSource, text: string): ExtractResult {
  // Confirms the outbound booking URL and named nights. Never copy prices.
  const hasCollection = /Detty December Fest/i.test(text);
  const nights: string[] = [];
  if (/Wizkid/i.test(text) && /18\s*Dec/i.test(text)) nights.push("Wizkid on 18 December");
  if (/Tunez/i.test(text) && /24\s*Dec/i.test(text)) {
    nights.push(
      /Friends/i.test(text)
        ? "DJ Tunez and Friends on 24 December"
        : "DJ Tunez on 24 December",
    );
  }
  if (/Tungba/i.test(text) && /25\s*Dec/i.test(text)) {
    nights.push("Tungba Christmas on 25 December");
  }
  if (!hasCollection || nights.length === 0) {
    return {
      published: [],
      held: [
        hold(source, "Ticket collection did not name Detty December Fest nights clearly.", {
          ticketsUrl: source.url,
        }),
      ],
      detail: "incomplete ticket facts",
    };
  }
  return {
    published: [
      publish(source, {
        region: "Lagos",
        when: "18-30 December",
        summary: `Detty December Fest. ${nights.join(", ")}.`,
        ticketsUrl: source.url,
        url: "https://dettydecfest.com/",
      }),
    ],
    held: [],
    detail: "Ticket collection opens; prices not stored",
  };
}

function extractRhythmUnplugged(source: EventFeedSource, text: string): ExtractResult {
  const hasName = /Rhythm Unplugged/i.test(text);
  const hasDate = /December\s*21/i.test(text) || /DEC\s*21/i.test(text);
  const hasVenue = /Eko Convention Cent(?:re|er)/i.test(text);
  const hasLilBaby = /Lil Baby/i.test(text);
  const hasKehlani = /Kehlani/i.test(text);
  if (!hasName || !hasDate || !hasVenue || !hasLilBaby || !hasKehlani) {
    return {
      published: [],
      held: [
        hold(
          source,
          "News report did not state Rhythm Unplugged, 21 December, Eko Convention Centre, Lil Baby, and Kehlani together.",
        ),
      ],
      detail: "incomplete fields",
    };
  }
  return {
    published: [
      publish(source, {
        region: "Lagos",
        when: "21 December",
        summary:
          "Coca-Cola Rhythm Unplugged, Lil Baby and Kehlani, Eko Convention Centre.",
      }),
    ],
    held: [],
    detail: "Rhythm Unplugged confirmed",
  };
}

function extractFlytimeHouseRb(source: EventFeedSource, text: string): ExtractResult {
  const hasName = /House of R(?:\s*&\s*|\s+and\s+)B/i.test(text);
  const hasBrandy = /Brandy/i.test(text);
  const hasDate = /December\s*20/i.test(text) || /20\s*December/i.test(text);
  const hasVenue = /Eko Convention Cent(?:re|er)/i.test(text);
  if (!hasName || !hasBrandy || !hasDate) {
    return {
      published: [],
      held: [
        hold(
          source,
          "Essence article did not clearly state Flytime House of R&B, Brandy, and 20 December. Not used for Flytime Fest or Circle.",
        ),
      ],
      detail: "incomplete or fetch failed",
    };
  }
  const summary = hasVenue
    ? "Flytime House of R&B, Brandy, Eko Convention Centre."
    : "Flytime House of R&B, Brandy.";
  return {
    published: [
      publish(source, {
        region: "Lagos",
        when: "20 December",
        summary,
      }),
    ],
    held: [],
    detail: "House of R&B confirmed (this source only)",
  };
}

function extractDecemberInGhana(source: EventFeedSource, text: string): ExtractResult {
  const hasSeason =
    /1\s*December\s*2026\s*to\s*3\s*January\s*2027/i.test(text) ||
    /from\s*1\s*December\s*2026\s*to\s*3\s*January\s*2027/i.test(text);
  const hasName = /December in GH/i.test(text) || /December in Ghana/i.test(text);
  const hasGta = /Ghana Tourism Authority/i.test(text) || /\bGTA\b/.test(text);
  const hasBlackStar = /Black Star Experience/i.test(text);
  if (!hasSeason || !hasName) {
    return {
      published: [],
      held: [
        hold(
          source,
          "News report did not state December in GH dates 1 December 2026 to 3 January 2027.",
        ),
      ],
      detail: "incomplete fields",
    };
  }
  let summary: string;
  if (hasGta && hasBlackStar) {
    summary =
      "December in Ghana, under the Ghana Tourism Authority and the Black Star Experience. These season dates are official.";
  } else if (hasGta) {
    summary =
      "December in Ghana, under the Ghana Tourism Authority. These season dates are from the named news report.";
  } else {
    summary = "December in Ghana. These season dates are from the named news report.";
  }
  return {
    published: [
      publish(source, {
        region: "Ghana",
        when: "1 December 2026 to 3 January 2027",
        summary,
      }),
    ],
    held: [],
    detail: "Ghana season dates confirmed",
  };
}

function extractProbe(source: EventFeedSource, holdReason: string): ExtractResult {
  return {
    published: [],
    held: [hold(source, holdReason)],
    detail: "probe held — no auto-publish",
  };
}

type CarnivalItem = { title: string; date: string };

function parseCarnivalScheduleItems(js: string): CarnivalItem[] {
  const items: CarnivalItem[] = [];
  for (const match of js.matchAll(/title:"([^"]+)",date:"([^"]+)"/g)) {
    items.push({ title: decodeEntities(match[1]), date: match[2] });
  }
  return items;
}

function carnivalDateToWhen(date: string) {
  const single = date.match(/^([A-Za-z]+) (\d{1,2}), (\d{4})$/);
  if (single) return `${single[2]} ${single[1]}`;
  const range = date.match(/^([A-Za-z]+) (\d{1,2})–(\d{1,2}), (\d{4})$/);
  if (range) return `${range[2]}-${range[3]} ${range[1]}`;
  const span = date.match(
    /^([A-Za-z]+) (\d{1,2}), (\d{4}) – ([A-Za-z]+) (\d{1,2}), (\d{4})$/,
  );
  if (span) {
    return `${span[2]} ${span[1]} ${span[3]} to ${span[5]} ${span[4]} ${span[6]}`;
  }
  return date;
}

function carnivalPeakSummary(items: CarnivalItem[], theme: string | null) {
  const onDay = (day: string) =>
    items.filter((item) => item.date.includes(`December ${day}, 2026`));

  const cultural = onDay("26").find((item) => /Cultural Carnival/i.test(item.title));
  const kings = onDay("26").find((item) => /Night of Kings/i.test(item.title));
  const junior = onDay("27").find((item) => /Junior Carnival/i.test(item.title));
  const parade = onDay("28").find((item) =>
    /Parade of Bands|Carnival Calabar and Parade/i.test(item.title),
  );
  const bikers = onDay("29").find((item) => /Bikers Carnival/i.test(item.title));
  const nyoro = onDay("30").find((item) => /Nyoro Ekpe/i.test(item.title));

  const parts: string[] = [];
  if (cultural && kings) {
    parts.push("Cultural Carnival and Night of Kings & Queens on the 26th");
  } else if (cultural) {
    parts.push("Cultural Carnival on the 26th");
  } else if (kings) {
    parts.push("Night of Kings & Queens on the 26th");
  }
  if (junior) parts.push("Junior Carnival on the 27th");
  if (parade) parts.push("Parade of the Bands on the 28th");
  if (bikers) parts.push("Bikers Carnival on the 29th");
  if (nyoro) parts.push("Nyoro Ekpe on the 30th");

  if (parts.length < 3) return null;

  let summary = "Carnival Calabar.";
  if (theme) summary += ` Theme: ${theme}.`;
  summary += ` ${parts.join(", ")}.`;
  return { summary, peakTitles: new Set(
    [cultural, kings, junior, parade, bikers, nyoro]
      .filter(Boolean)
      .map((item) => item!.title),
  ) };
}

async function extractCarnival(source: EventFeedSource): Promise<ExtractResult> {
  const home = await fetchText(source.url);
  if (!home.ok) {
    return {
      published: [],
      held: [hold(source, `Official page returned HTTP ${home.status}.`)],
      detail: `HTTP ${home.status}`,
    };
  }

  const assetMatch = home.body.match(/src="(\/assets\/index-[^"]+\.js)"/i);
  if (!assetMatch) {
    return {
      published: [],
      held: [hold(source, "Could not find the Carnival SPA bundle to locate the schedule.")],
      detail: "no SPA bundle",
    };
  }

  const origin = new URL(source.url).origin;
  const indexJs = await fetchText(`${origin}${assetMatch[1]}`);
  if (!indexJs.ok) {
    return {
      published: [],
      held: [hold(source, `SPA bundle returned HTTP ${indexJs.status}.`)],
      detail: `bundle HTTP ${indexJs.status}`,
    };
  }

  const scheduleName = indexJs.body.match(/assets\/(schedule-[A-Za-z0-9_-]+\.js)/);
  const themeName = indexJs.body.match(/assets\/(theme-2026-[A-Za-z0-9_-]+\.js)/);
  if (!scheduleName) {
    return {
      published: [],
      held: [hold(source, "Schedule chunk name not found in the Carnival SPA bundle.")],
      detail: "no schedule chunk",
    };
  }

  const scheduleJs = await fetchText(`${origin}/assets/${scheduleName[1]}`);
  if (!scheduleJs.ok) {
    return {
      published: [],
      held: [hold(source, `Schedule chunk returned HTTP ${scheduleJs.status}.`)],
      detail: `schedule HTTP ${scheduleJs.status}`,
    };
  }

  const items = parseCarnivalScheduleItems(scheduleJs.body);
  let theme: string | null = null;
  if (themeName) {
    const themeJs = await fetchText(`${origin}/assets/${themeName[1]}`);
    if (themeJs.ok && /Rethinking Our Collective Destiny/.test(themeJs.body)) {
      theme = "Rethinking Our Collective Destiny";
    }
  }

  const peak = carnivalPeakSummary(items, theme);
  const published: IngestEvent[] = [];
  const held: HeldCandidate[] = [];

  if (peak) {
    published.push(
      publish(source, {
        region: "Calabar",
        when: "26-30 December",
        summary: peak.summary,
      }),
    );
  } else {
    held.push(
      hold(
        source,
        "Peak Carnival nights (26–30 December) were incomplete on the official schedule.",
      ),
    );
  }

  const scheduleUrl = `${origin}/schedule`;
  let schedulePublished = 0;
  for (const item of items) {
    if (!item.title || !item.date) continue;
    if (peak?.peakTitles.has(item.title)) continue;
    // Complete sourced fields from the official schedule JS — publish each night.
    published.push(
      publish(source, {
        region: "Calabar",
        when: carnivalDateToWhen(item.date),
        summary: item.title,
        url: scheduleUrl,
      }),
    );
    schedulePublished += 1;
  }

  return {
    published,
    held,
    detail: peak
      ? `Peak rollup + ${schedulePublished} schedule rows published`
      : schedulePublished > 0
        ? `${schedulePublished} schedule rows published; peak incomplete`
        : "peak incomplete",
  };
}

async function runSource(source: EventFeedSource): Promise<ExtractResult & { ok: boolean }> {
  if (source.kind === "carnival-schedule-js") {
    const result = await extractCarnival(source);
    return { ...result, ok: result.published.length > 0 || result.held.length > 0 };
  }

  if (source.kind === "probe") {
    const fetched = await fetchText(source.url);
    if (!fetched.ok) {
      return {
        ok: false,
        published: [],
        held: [hold(source, `Source returned HTTP ${fetched.status}.`)],
        detail: `HTTP ${fetched.status}`,
      };
    }
    const reasons: Record<string, string> = {
      "flytime-home":
        "flytimefest.com homepage does not name 2026 House of R&B, Fest, or Circle dates. Held — do not invent nights from news about a different show.",
      "decemberingh-home":
        "decemberingh.com does not state the 2026 season dates. Season dates stay on the named MyJoyOnline report until an official page states them.",
      "ghana-travel-bse":
        "Ghana Tourism Black Star Experience page did not state the 2026 season dates in a form this ingest can publish.",
    };
    return {
      ok: true,
      ...extractProbe(source, reasons[source.extractor] ?? "Probe-only source; not auto-published."),
    };
  }

  const fetched = await fetchText(source.url);
  if (!fetched.ok) {
    return {
      ok: false,
      published: [],
      held: [hold(source, `Source returned HTTP ${fetched.status}.`)],
      detail: `HTTP ${fetched.status}`,
    };
  }

  const text = htmlToText(fetched.body);

  switch (source.extractor) {
    case "oriade":
      return { ok: true, ...extractOriade(source, text, fetched.body) };
    case "detty-fest":
      return { ok: true, ...extractDettyFest(source, text) };
    case "detty-tickets":
      return { ok: true, ...extractDettyTickets(source, text) };
    case "rhythm-unplugged":
      return { ok: true, ...extractRhythmUnplugged(source, text) };
    case "flytime-house-rb":
      return { ok: true, ...extractFlytimeHouseRb(source, text) };
    case "december-in-ghana":
      return { ok: true, ...extractDecemberInGhana(source, text) };
    default:
      return {
        ok: false,
        published: [],
        held: [hold(source, `No extractor registered for ${source.extractor}.`)],
        detail: "unknown extractor",
      };
  }
}

function sourceRank(sourceId: string | undefined) {
  if (!sourceId) return 0;
  if (sourceId.includes("tickets")) return 2;
  if (
    sourceId.includes("fest") ||
    sourceId.includes("oriade") ||
    sourceId.includes("carnival")
  ) {
    return 3;
  }
  return 1;
}

function mergePublished(rows: IngestEvent[]): IngestEvent[] {
  const map = new Map<string, IngestEvent>();
  for (const row of rows) {
    const key = eventKey(row);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...row });
      continue;
    }
    const next = { ...existing };
    if (sourceRank(row.sourceId) >= sourceRank(existing.sourceId)) {
      next.summary = row.summary;
      next.url = row.url ?? next.url;
      next.urlLabel = row.urlLabel ?? next.urlLabel;
      next.sourceId = row.sourceId ?? next.sourceId;
    }
    if (row.ticketsUrl) next.ticketsUrl = row.ticketsUrl;
    if (!next.url && row.url) next.url = row.url;
    map.set(key, next);
  }
  return [...map.values()];
}

export function ingestDataDir(repoRoot: string) {
  return join(repoRoot, "data", "event-ingest");
}

export function readIngestSnapshot(repoRoot: string): IngestSnapshot | null {
  const path = join(ingestDataDir(repoRoot), "last-run.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as IngestSnapshot;
  } catch {
    return null;
  }
}

export function writeIngestSnapshot(repoRoot: string, report: IngestReport) {
  const dir = ingestDataDir(repoRoot);
  mkdirSync(dir, { recursive: true });
  const snapshot: IngestSnapshot = {
    checkedAt: report.checkedAt,
    cadenceDays: report.cadenceDays,
    published: report.published,
    held: report.held,
    sources: report.sources,
  };
  writeFileSync(join(dir, "last-run.json"), `${JSON.stringify(snapshot, null, 2)}\n`);
  writeFileSync(
    join(dir, "published.json"),
    `${JSON.stringify({ checkedAt: report.checkedAt, events: report.published }, null, 2)}\n`,
  );
  writeFileSync(
    join(dir, "held.json"),
    `${JSON.stringify({ checkedAt: report.checkedAt, held: report.held }, null, 2)}\n`,
  );
  return dir;
}

export async function runEventIngest(): Promise<IngestReport> {
  const publishedRaw: IngestEvent[] = [];
  const held: HeldCandidate[] = [];
  const sources: SourceRun[] = [];

  for (const source of eventFeedSources) {
    try {
      const result = await runSource(source);
      publishedRaw.push(...result.published);
      held.push(...result.held);
      sources.push({
        id: source.id,
        url: source.url,
        ok: result.ok,
        detail: result.detail,
        published: result.published.length,
        held: result.held.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "ingest failed";
      held.push(hold(source, message));
      sources.push({
        id: source.id,
        url: source.url,
        ok: false,
        detail: message,
        published: 0,
        held: 1,
      });
    }
  }

  // Explicit holds for Flytime Fest / Circle until an organiser page names them.
  held.push({
    sourceId: "flytime-fest-home",
    url: "https://www.flytimefest.com/",
    urlLabel: "Organiser's page",
    region: "Lagos",
    when: "22-24 December",
    summary: "Flytime Fest",
    holdReason:
      "No organiser page opened that names Flytime Fest 22–24 December 2026. Essence Brandy article is not this event’s source. Seed row kept until a solid source exists (DD-2).",
  });
  held.push({
    sourceId: "flytime-fest-home",
    url: "https://www.flytimefest.com/",
    urlLabel: "Organiser's page",
    region: "Lagos",
    when: "25 December",
    summary: "Flytime Circle",
    holdReason:
      "No organiser page opened that names Flytime Circle 25 December 2026. Essence Brandy article is not this event’s source. Seed row kept until a solid source exists (DD-2).",
  });

  return {
    checkedAt: new Date().toISOString(),
    cadenceDays: EVENT_INGEST_CADENCE_DAYS,
    sources,
    published: mergePublished(publishedRaw),
    held,
  };
}
