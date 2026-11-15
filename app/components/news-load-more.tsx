"use client";

import type { TickerItem } from "../ticker-events";
import { LoadMoreList } from "./load-more";

export function NewsLoadMore({ items }: { items: TickerItem[] }) {
  return (
    <LoadMoreList items={items} mobileSize={6} desktopSize={12} noun="headlines">
      {(visible) => (
        <div className="space-y-10">
          {visible.map((item) => (
            <article key={item.link} className="border-t border-ink/15 pt-8">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.headline} className="mb-5 h-auto w-full" />
              ) : null}
              <p className="text-[11px] uppercase tracking-[0.18em] text-oxide">{item.source}</p>
              <h2 className="mt-2 font-display text-3xl leading-none tracking-tight">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                  {item.headline}
                  <span className="mt-2 block font-sans text-sm font-normal normal-case tracking-normal text-muted">Leaves this site</span>
                </a>
              </h2>
              {item.published ? <time className="mt-3 block text-sm leading-6 text-muted">{item.published}</time> : null}
              {item.description ? <p className="mt-3 text-base leading-7 text-ink">{item.description}</p> : null}
            </article>
          ))}
        </div>
      )}
    </LoadMoreList>
  );
}
