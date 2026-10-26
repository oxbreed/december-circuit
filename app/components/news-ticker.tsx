"use client";

import { useEffect, useState } from "react";
import { eventTickerItems, type TickerItem } from "../ticker-events";

const REFRESH_MS = 20 * 60 * 1000;

type Payload = {
  news: TickerItem[];
  events: TickerItem[];
  newsAvailable: boolean;
};

function isInternal(link: string) {
  return link.startsWith("/");
}

/** Real crawlable copy — one set of next-8 events (+ news when available). */
function ItemLink({ item }: { item: TickerItem }) {
  const body = (
    <>
      <span className="text-[10px] uppercase tracking-[0.18em] text-oxide">{item.source}</span>
      <span className="text-sm text-ink">{item.headline}</span>
      {item.published ? (
        <time className="text-xs text-muted">{item.published}</time>
      ) : null}
    </>
  );

  if (isInternal(item.link)) {
    return (
      <a href={item.link} className="inline-flex shrink-0 items-baseline gap-3 whitespace-nowrap px-4">
        {body}
      </a>
    );
  }

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-baseline gap-3 whitespace-nowrap px-4"
    >
      {body}
    </a>
  );
}

/** Visual loop clone only — not for crawlers (aria-hidden, no real links). */
function ItemClone({ item }: { item: TickerItem }) {
  return (
    <span className="inline-flex shrink-0 items-baseline gap-3 whitespace-nowrap px-4">
      <span className="text-[10px] uppercase tracking-[0.18em] text-oxide">{item.source}</span>
      <span className="text-sm text-ink">{item.headline}</span>
      {item.published ? (
        <span className="text-xs text-muted">{item.published}</span>
      ) : null}
    </span>
  );
}

export function NewsTicker() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const response = await fetch("/api/news");
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as Payload;
        if (!ignore) {
          setPayload(data);
          setFailed(false);
        }
      } catch {
        if (!ignore) setFailed(true);
      }
    }

    void load();
    const timer = window.setInterval(() => void load(), REFRESH_MS);
    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, []);

  const events = payload?.events ?? eventTickerItems();
  const news = payload?.news ?? [];
  const newsMissing = failed || (payload !== null && !payload.newsAvailable);
  // One real copy: entertainment headlines (when available) + next 8 events.
  const items = [...news, ...events];
  const seconds = Math.max(48, Math.max(items.length, 1) * 2 * 7);

  return (
    <div
      className="news-ticker border-y border-gold/40 bg-[#efe4d0]"
      aria-label="Confirmed events and entertainment headlines"
    >
      <div className="news-ticker-window">
        <div
          className="news-ticker-track flex w-max flex-nowrap items-center py-2"
          style={{ animationDuration: `${seconds}s` }}
        >
          {payload === null && !failed ? (
            <span
              className="mx-4 inline-block h-3 w-40 shrink-0 animate-pulse bg-ink/15"
              aria-busy="true"
            />
          ) : null}
          {newsMissing ? (
            <span className="shrink-0 whitespace-nowrap px-4 text-xs text-muted">
              News feeds did not return any items.
            </span>
          ) : null}
          {items.length > 0 ? (
            <div className="flex shrink-0 items-center">
              {items.map((item, index) => (
                <ItemLink key={`${item.kind}-${item.link}-${index}`} item={item} />
              ))}
            </div>
          ) : null}
          {items.length > 0 ? (
            <div className="news-ticker-duplicate flex shrink-0 items-center" aria-hidden="true">
              {items.map((item, index) => (
                <ItemClone key={`${item.kind}-${item.link}-${index}-copy`} item={item} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
