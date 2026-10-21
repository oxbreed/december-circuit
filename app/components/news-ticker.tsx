"use client";

import { useEffect, useState } from "react";
import { eventTickerItems, type TickerItem } from "../ticker-events";

const REFRESH_MS = 20 * 60 * 1000;

type Payload = {
  news: TickerItem[];
  events: TickerItem[];
  newsAvailable: boolean;
};

function ItemLink({ item }: { item: TickerItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-baseline gap-3 whitespace-nowrap px-4"
    >
      <span className="text-[10px] uppercase tracking-[0.18em] text-gold">{item.source}</span>
      <span className="text-sm text-mist">{item.headline}</span>
      {item.published ? (
        <time className="text-xs text-muted">{item.published}</time>
      ) : null}
    </a>
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
  const items = [...news, ...events];
  const loop = items.length > 0 ? [...items, ...items] : [];
  const seconds = Math.max(48, loop.length * 7);

  return (
    <div
      className="news-ticker border-y border-gold/30 bg-[rgba(8,10,16,0.88)] backdrop-blur-md"
      aria-label="Events on file and entertainment headlines"
    >
      {payload === null && !failed ? (
        <p className="px-4 py-2 text-xs uppercase tracking-[0.16em] text-brass">Loading news</p>
      ) : null}
      {newsMissing ? (
        <p className="px-4 py-2 text-xs text-muted">News feeds did not return any items.</p>
      ) : null}
      {loop.length > 0 ? (
        <div className="overflow-hidden">
          <div
            className="news-ticker-track flex w-max items-center py-2"
            style={{ animationDuration: `${seconds}s` }}
          >
            {loop.map((item, index) => (
              <ItemLink key={`${item.kind}-${item.link}-${index}`} item={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
