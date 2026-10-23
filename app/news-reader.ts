import "server-only";
import { cacheLife } from "next/cache";
import { newsFeedUrls } from "./news-feeds";
import { eventTickerItems, type TickerItem } from "./ticker-events";

const PER_FEED = 6;
const FEED_TIMEOUT_MS = 6000;

export type NewsPayload = {
  news: TickerItem[];
  events: TickerItem[];
  newsAvailable: boolean;
};

function decode(value: string) {
  const text = value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
  return text
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function unescapeUrl(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#0*38;/g, "&")
    .replace(/&#x0*26;/gi, "&")
    .trim();
}

function first(xml: string, pattern: RegExp) {
  return xml.match(pattern)?.[1] ?? "";
}

function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
  return unescapeUrl(match?.[1] ?? match?.[2] ?? "");
}

function isHttpUrl(url: string) {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function isSvg(url: string, type: string) {
  return /image\/svg\+xml/i.test(type) || /\.svg(?:$|[?#])/i.test(url);
}

function hasImageExtension(url: string) {
  const path = url.split("#")[0] ?? url;
  return /\.(?:jpe?g|png|webp|gif|avif)(?:$|[?#])/i.test(path);
}

function declaredImage(tag: string, thumbnail: boolean) {
  const url = attr(tag, "url");
  const type = attr(tag, "type");
  const medium = attr(tag, "medium");
  if (!isHttpUrl(url) || isSvg(url, type)) return "";
  if (thumbnail) return url;
  if (/^image\//i.test(type) || /^image$/i.test(medium) || hasImageExtension(url)) return url;
  return "";
}

function imageFromItem(block: string) {
  const declared = [
    ...block.matchAll(/<media:content\b[^>]*>/gi),
    ...block.matchAll(/<enclosure\b[^>]*>/gi),
  ];
  for (const tag of declared) {
    const url = declaredImage(tag[0], false);
    if (url) return url;
  }
  for (const tag of block.matchAll(/<media:thumbnail\b[^>]*>/gi)) {
    const url = declaredImage(tag[0], true);
    if (url) return url;
  }
  for (const tag of block.matchAll(/<img\b[^>]*>/gi)) {
    const url = attr(tag[0], "src");
    if (isHttpUrl(url) && !isSvg(url, "")) return url;
  }
  return "";
}

function descriptionFromItem(block: string) {
  const raw =
    first(block, /<description\b[^>]*>([\s\S]*?)<\/description>/i) ||
    first(block, /<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
  return decode(raw);
}

function parseFeed(xml: string): TickerItem[] {
  const channel = xml.match(/<channel\b[\s\S]*/i)?.[0] ?? xml.match(/<feed\b[\s\S]*/i)?.[0] ?? xml;
  const source = decode(first(channel, /<title[^>]*>([\s\S]*?)<\/title>/i));
  if (!source) return [];

  const blocks = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  const entries = blocks.length
    ? blocks
    : [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((match) => match[0]);

  const items: TickerItem[] = [];
  for (const block of entries) {
    if (items.length >= PER_FEED) break;
    const headline = decode(first(block, /<title[^>]*>([\s\S]*?)<\/title>/i));
    let link = decode(first(block, /<link[^>]*>([\s\S]*?)<\/link>/i));
    if (!link) link = decode(first(block, /<link\b[^>]*href=["']([^"']+)["']/i));
    const published = decode(
      first(
        block,
        /<(?:pubDate|dc:date|published)\b[^>]*>([\s\S]*?)<\/(?:pubDate|dc:date|published)>/i,
      ),
    );
    if (!headline || !/^https?:\/\//i.test(link)) continue;
    const item: TickerItem = { kind: "news", headline, source, link };
    if (published) item.published = published;
    const description = descriptionFromItem(block);
    if (description) item.description = description;
    const image = imageFromItem(block);
    if (image && image !== link) item.image = image;
    items.push(item);
  }
  return items;
}

async function readFeed(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    headers: {
      accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      "user-agent": "DecemberCircuit/1.0",
    },
  });
  if (!response.ok) return [];
  const xml = await response.text();
  return parseFeed(xml);
}

export async function loadNews(): Promise<NewsPayload> {
  "use cache";
  cacheLife({ stale: 1200, revalidate: 1200, expire: 1200 });
  const settled = await Promise.allSettled(newsFeedUrls.map((url) => readFeed(url)));
  const seen = new Set<string>();
  const news: TickerItem[] = [];
  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      if (seen.has(item.link)) continue;
      seen.add(item.link);
      news.push(item);
    }
  }
  return {
    news,
    events: eventTickerItems(),
    newsAvailable: news.length > 0,
  };
}
