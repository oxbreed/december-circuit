"use client";

import { LoadMoreList } from "./load-more";

type AirportGroup = {
  airport: string;
  origins: { origin: string; url: string }[];
};

export function GuideArriveLoadMore({ airports }: { airports: AirportGroup[] }) {
  return (
    <LoadMoreList items={airports} mobileSize={6} desktopSize={12} noun="airports">
      {(visible) => (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((airport) => (
            <article key={airport.airport} className="min-w-0 border border-ink/15 bg-chart p-4">
              <h3 className="font-display text-2xl leading-tight tracking-tight">
                {airport.airport}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
                {airport.origins.map((origin) => (
                  <li key={origin.origin}>
                    <a
                      href={origin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                    >
                      {origin.origin}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </LoadMoreList>
  );
}