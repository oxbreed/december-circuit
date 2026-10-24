"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Pin } from "../pins";
import { directionsHref, pinId } from "./pin-id";
import { SectionIntro, sectionClass } from "./section-intro";
import { EmptyNote, ErrorNote } from "./states";
import { useRecords } from "./use-records";

function MapSkeleton() {
  return (
    <div className="map-skeleton h-full min-h-48 w-full" aria-busy="true">
      <span className="sr-only">Map</span>
    </div>
  );
}

const mapFrameClass =
  "map-frame h-[min(52vh,calc(100svh-16.5rem))] min-h-0 border border-ink/20 shadow-[6px_6px_0_0_rgba(138,98,50,0.18)] lg:h-[min(68vh,640px)] lg:min-h-[280px]";

const CircuitMap = dynamic(() => import("./circuit-map"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const mapStyles = `
  .map-skeleton {
    background:
      radial-gradient(circle at 32% 42%, rgba(27, 104, 78, 0.16), transparent 26%),
      radial-gradient(circle at 68% 62%, rgba(138, 98, 50, 0.2), transparent 18%),
      #e7dfd2;
  }
  @media (max-width: 1023px) {
    #map .map-stage {
      height: calc(100svh - var(--mobile-bar, 7.5rem) - 12px);
      overflow: hidden;
    }
    #map .map-lead h2 {
      font-size: 2rem;
      line-height: 1.05;
    }
    #map .map-lead .mb-10 > p:last-child {
      font-size: 1rem;
      line-height: 1.45;
    }
    #map .map-filters .chip {
      font-size: 13px;
      letter-spacing: 0.04em;
      line-height: 1.3;
      padding: 0.5rem 0.75rem;
    }
    #map .map-frame {
      scroll-margin-top: 4.5rem;
      scroll-margin-bottom: calc(var(--mobile-bar, 7.5rem) + 12px);
    }
    #map .pin-list {
      padding-bottom: 0.5rem;
    }
    #map .pin-list li {
      scroll-margin-bottom: calc(var(--mobile-bar, 7.5rem) + 12px);
    }
    #map .pin-list a,
    #map .pin-list p {
      font-size: 1rem;
      line-height: 1.45;
    }
    #map .pin-list a span,
    #map .pin-list a[href*="openstreetmap"] {
      font-size: 13px;
      letter-spacing: 0.04em;
    }
    .maplibregl-popup.map-pin-tip .maplibregl-popup-content {
      font-size: 15px;
    }
    .maplibre-map .maplibregl-ctrl-group button {
      width: 36px;
      height: 36px;
    }
    .maplibre-map .maplibregl-ctrl-attrib {
      font-size: 12px;
      line-height: 1.3;
      max-width: calc(100% - 8px);
    }
  }
`;

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

  function showPin(id: string) {
    setActiveId(id);
    document.querySelector("#map .map-frame")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  return (
    <section id="map" className={sectionClass}>
      <style>{mapStyles}</style>
      <div className="map-stage">
        <div className="map-lead">
          <SectionIntro
            kicker="Map"
            title="Sourced pins"
            lede="Only places with a sourced coordinate. Directions open an external map from that point."
          />
          <p className="mb-6 max-w-2xl text-sm leading-6 text-muted">
            Looking for more hotels, restaurants, clubs, or landmarks?{" "}
            <Link
              href="/explore"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Explore map search
            </Link>{" "}
            shows OpenStreetMap points — map data, not checked listings.
          </p>
          {pins.status === "error" ? (
            <ErrorNote message="The map did not load." onRetry={pins.retry} />
          ) : null}
          {pins.status === "ready" && records.length === 0 ? (
            <EmptyNote>No places with a coordinate are listed.</EmptyNote>
          ) : null}
        </div>
        {pins.status === "ready" && records.length > 0 ? (
          <div className="map-filters mb-4">
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
          </div>
        ) : null}
        {pins.status === "loading" ? (
          <div className="map-column">
            <div className={mapFrameClass} role="region" aria-label="Map">
              <MapSkeleton />
            </div>
          </div>
        ) : null}
        {pins.status === "ready" && records.length > 0 ? (
          <div className="map-column">
            <div
              className={mapFrameClass}
              role="region"
              aria-label="OpenStreetMap of sourced pins"
            >
              {visible.length > 0 ? (
                <CircuitMap
                  pins={visible}
                  activeId={activeId}
                  onSelect={showPin}
                />
              ) : (
                <div className="flex h-full items-center px-4">
                  <p className="text-base text-muted">No pins for {city}.</p>
                </div>
              )}
              {active ? (
                <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-4.5rem)] border border-ink bg-paper px-3 py-3 md:max-w-sm">
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
                  <p className="mt-1 font-mono text-[13px] leading-5 text-muted">
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
              <p className="map-caption mt-3 max-w-xl text-sm leading-6 text-muted">
                Some of these pins share one coordinate. Choose a name to bring
                that place forward.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {pins.status === "ready" && records.length > 0 ? (
        <ul className="pin-list border-t border-line lg:max-h-[min(68vh,640px)] lg:overflow-auto lg:border lg:px-3">
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
                          onClick={() => showPin(id)}
                          aria-pressed={selected}
                          className="mt-1 block text-left font-mono text-[13px] uppercase tracking-[0.08em] text-muted"
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
      ) : null}
    </section>
  );
}
