"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Pin } from "../pins";
import { directionsHref, pinId } from "./pin-id";
import { EmptyNote, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

const CircuitMap = dynamic(() => import("./circuit-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center px-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
        Loading the map
      </p>
    </div>
  ),
});

function BandHeading({
  kicker,
  title,
  href,
  action,
}: {
  kicker: string;
  title: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">{kicker}</p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
          {title}
        </h2>
      </div>
      <a href={href} className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide">
        {action}
      </a>
    </div>
  );
}

export function HomeBands() {
  const pins = useRecords<Pin[]>("/api/pins");
  const [activeId, setActiveId] = useState<string | null>(null);

  const pinRecords = pins.status === "ready" ? pins.data : [];
  const active = pinRecords.find((pin) => pinId(pin) === activeId) ?? null;

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <BandHeading kicker="Map" title="Sourced pins" href="/map" action="Open the map →" />
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Only places with a sourced coordinate. Directions open an external map
          from that point.
        </p>
        {pins.status === "loading" ? <LoadingLines label="Loading the map" /> : null}
        {pins.status === "error" ? (
          <ErrorNote message="The map did not load." onRetry={pins.retry} />
        ) : null}
        {pins.status === "ready" && pinRecords.length === 0 ? (
          <EmptyNote>No places with coordinates are on file.</EmptyNote>
        ) : null}
        {pinRecords.length > 0 ? (
          <div
            className="map-frame mt-6 h-[min(22rem,calc(100svh-16.5rem))] border border-ink/20 shadow-[6px_6px_0_0_rgba(138,98,50,0.2)] lg:h-[26rem]"
            role="region"
            aria-label="OpenStreetMap of sourced pins"
          >
            <CircuitMap pins={pinRecords} activeId={activeId} onSelect={setActiveId} />
            {active ? (
              <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-4.5rem)] border border-ink/15 bg-paper px-3 py-3 md:max-w-sm">
                {active.url ? (
                  <a
                    href={active.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leading-6 underline decoration-gold/50 underline-offset-4"
                  >
                    {active.name}
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-oxide no-underline">
                      Organiser page — leaves this site
                    </span>
                  </a>
                ) : (
                  <p className="leading-6">{active.name}</p>
                )}
                <p className="mt-1 text-sm text-muted">
                  {active.city}, {active.country}
                </p>
                <a
                  href={directionsHref(active)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[11px] uppercase tracking-[0.16em] text-lagoon"
                >
                  Directions
                </a>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
