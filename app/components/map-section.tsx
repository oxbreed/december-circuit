"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Pin } from "../pins";
import { directionsHref, pinId } from "./pin-id";
import { SectionIntro, sectionClass } from "./section-intro";
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

export function MapSection() {
  const pins = useRecords<Pin[]>("/api/pins");
  const [city, setCity] = useState("All");
  const [activeId, setActiveId] = useState<string | null>(null);

  const records = useMemo(
    () => (pins.status === "ready" ? pins.data : []),
    [pins],
  );
  const cities = useMemo(() => {
    const names: string[] = [];
    for (const pin of records) {
      if (!names.includes(pin.city)) names.push(pin.city);
    }
    return names;
  }, [records]);
  const visible = useMemo(
    () => (city === "All" ? records : records.filter((pin) => pin.city === city)),
    [records, city],
  );
  const active = visible.find((pin) => pinId(pin) === activeId) ?? null;
  const sharesCoordinate = visible.some((pin, index) =>
    visible.some(
      (other, otherIndex) =>
        otherIndex !== index &&
        other.latitude === pin.latitude &&
        other.longitude === pin.longitude,
    ),
  );

  function chooseCity(next: string) {
    setCity(next);
    setActiveId(null);
  }

  return (
    <section id="map" className={sectionClass}>
      <SectionIntro
        kicker="Map"
        title="Sourced pins"
        lede="Only places with a sourced coordinate. Directions open an external map from that point."
      />
      {pins.status === "loading" ? <LoadingLines label="Loading pins" /> : null}
      {pins.status === "error" ? (
        <ErrorNote message="The map did not load." onRetry={pins.retry} />
      ) : null}
      {pins.status === "ready" && records.length === 0 ? (
        <EmptyNote>No places with coordinates are on file.</EmptyNote>
      ) : null}
      {pins.status === "ready" && records.length > 0 ? (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
            {visible.length} {visible.length === 1 ? "pin" : "pins"}
          </p>
          <div
            role="radiogroup"
            aria-label="City"
            className="mt-4 -mx-5 flex w-full min-w-0 gap-2 overflow-x-auto px-5 pb-3 md:mx-0 md:flex-wrap md:px-0"
          >
            <button
              type="button"
              role="radio"
              aria-checked={city === "All"}
              className="chip"
              onClick={() => chooseCity("All")}
            >
              All
            </button>
            {cities.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={city === name}
                className="chip"
                onClick={() => chooseCity(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.8fr)]">
            <div>
              <div
                className="relative h-[52vh] min-h-[280px] overflow-hidden border border-ink/20 shadow-[6px_6px_0_0_rgba(138,98,50,0.18)] md:h-[min(68vh,640px)]"
                role="region"
                aria-label="OpenStreetMap of sourced pins"
              >
                {visible.length > 0 ? (
                  <CircuitMap
                    pins={visible}
                    activeId={activeId}
                    onSelect={setActiveId}
                  />
                ) : (
                  <div className="flex h-full items-center px-4">
                    <p className="text-muted">No pins are on file for {city}.</p>
                  </div>
                )}
                {active ? (
                  <div className="absolute top-3 left-3 z-[500] max-w-[calc(100%-4.5rem)] border border-ink bg-paper px-3 py-3 md:max-w-sm">
                    {active.url ? (
                      <a
                        href={active.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg leading-6 underline decoration-oxide/60 decoration-1 underline-offset-4"
                      >
                        {active.name}
                      </a>
                    ) : (
                      <p className="text-lg leading-6">{active.name}</p>
                    )}
                    <p className="mt-1 text-sm text-muted">
                      {active.city}, {active.country}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-muted">
                      {active.latitude}, {active.longitude}
                    </p>
                    <a
                      href={directionsHref(active)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-lagoon underline decoration-1 underline-offset-4"
                    >
                      Directions
                    </a>
                  </div>
                ) : null}
              </div>
              {sharesCoordinate ? (
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                  Some of these pins share one coordinate. Choose a name to bring
                  that place forward.
                </p>
              ) : null}
            </div>
            <ul className="border-t border-line lg:max-h-[min(68vh,640px)] lg:overflow-auto lg:border lg:px-3">
              {visible.map((pin) => {
                const id = pinId(pin);
                const selected = id === activeId;
                return (
                  <li key={id} className="border-b border-line py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {pin.url ? (
                          <a
                            href={pin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="leading-6 underline decoration-oxide/50 decoration-1 underline-offset-4"
                          >
                            {pin.name}
                            <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-oxide no-underline">
                              Organiser page — leaves this site
                            </span>
                          </a>
                        ) : (
                          <p className="leading-6">{pin.name}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveId(id)}
                          aria-pressed={selected}
                          className="mt-1 block text-left font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
                        >
                          {pin.city} · Show on map
                        </button>
                      </div>
                      <a
                        href={directionsHref(pin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-lagoon underline decoration-1 underline-offset-4"
                      >
                        Directions
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
