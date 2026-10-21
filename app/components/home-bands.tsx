"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { FlightSearch } from "../flights";
import type { Pin } from "../pins";
import type { Place } from "../places";
import { directionsHref, pinId } from "./pin-id";
import { EmptyNote, ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

const atmospheres = [
  "/atmosphere/night-skyline.jpg",
  "/atmosphere/night-lanterns.jpg",
  "/atmosphere/night-water.jpg",
  "/atmosphere/night-street.jpg",
  "/atmosphere/night-hall.jpg",
  "/atmosphere/night-club.jpg",
  "/atmosphere/night-stage.jpg",
  "/atmosphere/night-crowd.jpg",
];

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
        <p className="text-[11px] uppercase tracking-[0.28em] text-brass">{kicker}</p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
          {title}
        </h2>
      </div>
      <a href={href} className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-gold">
        {action}
      </a>
    </div>
  );
}

export function HomeBands() {
  const places = useRecords<Place[]>("/api/places");
  const flights = useRecords<FlightSearch[]>("/api/flights");
  const pins = useRecords<Pin[]>("/api/pins");
  const [activeId, setActiveId] = useState<string | null>(null);

  const cities = useMemo(() => {
    if (places.status !== "ready") return [];
    const list: { country: string; city: string; count: number }[] = [];
    for (const place of places.data) {
      const found = list.find(
        (item) => item.country === place.country && item.city === place.city,
      );
      if (found) found.count += 1;
      else list.push({ country: place.country, city: place.city, count: 1 });
    }
    return list;
  }, [places]);

  const flightCards = useMemo(() => {
    if (flights.status !== "ready") return [];
    const list: FlightSearch[] = [];
    for (const flight of flights.data) {
      if (!list.some((item) => item.airport === flight.airport)) list.push(flight);
    }
    return list;
  }, [flights]);

  const pinRecords = pins.status === "ready" ? pins.data : [];
  const active = pinRecords.find((pin) => pinId(pin) === activeId) ?? null;

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 md:py-8">
        <BandHeading
          kicker="Cities"
          title="Places on file"
          href="/places"
          action="All places →"
        />
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Each city opens the organiser pages already filed there. Cities outside
          Lagos stay on the list.
        </p>
        {places.status === "loading" ? <LoadingLines label="Loading cities" /> : null}
        {places.status === "error" ? (
          <ErrorNote message="Cities did not load." onRetry={places.retry} />
        ) : null}
        {places.status === "ready" && cities.length === 0 ? (
          <EmptyNote>No places are on file.</EmptyNote>
        ) : null}
        {cities.length > 0 ? (
          <div className="-mx-5 mt-6 flex gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:px-0">
            {cities.map((entry, index) => {
              const href = `/places?country=${encodeURIComponent(entry.country)}&city=${encodeURIComponent(entry.city)}`;
              return (
                <a
                  key={`${entry.country}-${entry.city}`}
                  href={href}
                  className="relative h-64 w-56 shrink-0 overflow-hidden rounded-3xl border border-gold/30 shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
                >
                  <img
                    src={atmospheres[index % atmospheres.length]}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
                  <div className="relative flex h-full flex-col justify-end p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-brass">
                      {entry.country}
                    </p>
                    <p className="mt-2 font-display text-3xl leading-none">{entry.city}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/75">
                      {entry.count} {entry.count === 1 ? "place" : "places"}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        ) : null}
      </section>

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
            className="relative mt-6 h-[22rem] overflow-hidden rounded-3xl border border-gold/30 shadow-[0_18px_50px_rgba(0,0,0,0.35)] md:h-[26rem]"
            role="region"
            aria-label="OpenStreetMap of sourced pins"
          >
            <CircuitMap pins={pinRecords} activeId={activeId} onSelect={setActiveId} />
            {active ? (
              <div className="absolute top-3 left-3 z-[500] max-w-[calc(100%-4.5rem)] rounded-2xl border border-gold/30 bg-[rgba(8,10,16,0.88)] px-3 py-3 backdrop-blur-md md:max-w-sm">
                {active.url ? (
                  <a
                    href={active.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leading-6 underline decoration-gold/50 underline-offset-4"
                  >
                    {active.name}
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

      <section className="mx-auto w-full max-w-6xl px-5 py-8 pb-16 md:px-8 md:py-10">
        <BandHeading
          kicker="Flights"
          title="Outbound searches"
          href="/flights"
          action="All searches →"
        />
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          One search for each airport on file. It is a search, not a fare or a seat.
          Every origin is on the flights page.
        </p>
        {flights.status === "loading" ? (
          <LoadingLines label="Loading flight searches" />
        ) : null}
        {flights.status === "error" ? (
          <ErrorNote message="Flight searches did not load." onRetry={flights.retry} />
        ) : null}
        {flights.status === "ready" && flightCards.length === 0 ? (
          <EmptyNote>No flight searches are on file.</EmptyNote>
        ) : null}
        {flightCards.length > 0 ? (
          <div className="-mx-5 mt-6 flex gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:px-0">
            {flightCards.map((flight) => (
              <a
                key={flight.airport}
                href={flight.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Search from ${flight.origin} for ${flight.airport}`}
                className="flex w-72 shrink-0 flex-col rounded-3xl border border-gold/30 bg-[#10151f]/90 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-brass">Search</p>
                <p className="mt-4 font-display text-2xl leading-tight">{flight.airport}</p>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted">From {flight.origin}</p>
                <span className="mt-6 text-[11px] uppercase tracking-[0.18em] text-gold">
                  Search →
                </span>
              </a>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
