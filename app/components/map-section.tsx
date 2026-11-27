"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { MapMarker } from "../map-markers";
import { MAP_FILTER_GROUP_LABELS, type MapFilterGroup } from "../map-marker-categories";
import { mapFocusCitiesWithPins, mapMarkersToCircuitPins } from "../map-markers";
import type { CircuitMapPin } from "../circuit-map-pin";
import { directionsHref } from "./pin-id";
import { SectionIntro, sectionClassCompact } from "./section-intro";
import { EmptyList, ErrorNote } from "./states";
import { useRecords } from "./use-records";
import { LoadMoreList } from "./load-more";
import { eventDateSpan } from "../event-dates";

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
      overflow: visible;
    }
    #map .map-lead > div:first-child {
      margin-bottom: 0.75rem;
    }
    #map .map-lead h2 {
      font-size: 1.75rem;
      line-height: 1.05;
    }
    #map .map-filters .chip {
      font-size: 13px;
      letter-spacing: 0.04em;
      line-height: 1.3;
      padding: 0.5rem 0.75rem;
    }
    #map .map-frame {
      height: min(52svh, 24rem);
      min-height: 16rem;
      scroll-margin-top: 4.5rem;
      scroll-margin-bottom: calc(var(--mobile-bar, 7.5rem) + 12px);
    }
    .maplibregl-popup.map-pin-tip .maplibregl-popup-content {
      font-size: 15px;
    }
  }
`;

type CategoryFilter = MapFilterGroup | "all";
type CityFilter = "all" | string;

function dateIncludesIso(when: string, iso: string) {
  const span = eventDateSpan(when);
  if (!span) return false;
  return iso >= span.start && iso <= span.end;
}

function osmRouteHref(
  from: Pick<MapMarker, "latitude" | "longitude">,
  to: Pick<MapMarker, "latitude" | "longitude">,
) {
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(`${from.latitude},${from.longitude};${to.latitude},${to.longitude}`)}`;
}

function formatDuration(seconds: number) {
  const rounded = Math.max(0, Math.round(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.round((rounded % 3600) / 60);
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
}

type TravelState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      durationSeconds: number;
      distanceMeters: number;
      provider: string;
    };

export function MapSection() {
  const markersState = useRecords<MapMarker[]>("/api/map-markers");
  const focusCities = useMemo(() => mapFocusCitiesWithPins(), []);
  const [city, setCity] = useState<CityFilter>("Lagos");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [date, setDate] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [travelFrom, setTravelFrom] = useState<string>("");
  const [travelTo, setTravelTo] = useState<string>("");
  const [travel, setTravel] = useState<TravelState>({ status: "idle" });

  const records = useMemo(
    () => (markersState.status === "ready" ? markersState.data : []),
    [markersState],
  );

  const dateOptions = useMemo(() => {
    const values = new Set<string>();
    for (const marker of records) {
      if (marker.kind === "event" && marker.dateStart) values.add(marker.dateStart);
    }
    return [...values].sort();
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((marker) => {
      if (city !== "all" && marker.city !== city) return false;
      if (category !== "all" && marker.filterGroup !== category) return false;
      if (date && marker.kind === "event") {
        if (!marker.when || !dateIncludesIso(marker.when, date)) return false;
      }
      return true;
    });
  }, [records, city, category, date]);

  const circuitPins: CircuitMapPin[] = useMemo(
    () => mapMarkersToCircuitPins(filtered),
    [filtered],
  );

  const active = filtered.find((marker) => marker.id === activeId) ?? null;

  const eventMarkers = useMemo(
    () => filtered.filter((marker) => marker.kind === "event"),
    [filtered],
  );

  const fromMarker = eventMarkers.find((m) => m.id === travelFrom) ?? null;
  const toMarker = eventMarkers.find((m) => m.id === travelTo) ?? null;

  const resetTravel = useCallback(() => {
    setTravel({ status: "idle" });
  }, []);

  const fetchTravelTime = useCallback(async () => {
    if (!fromMarker || !toMarker) return;
    setTravel({ status: "loading" });
    try {
      const response = await fetch("/api/travel-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLat: fromMarker.latitude,
          fromLon: fromMarker.longitude,
          toLat: toMarker.latitude,
          toLon: toMarker.longitude,
        }),
      });
      const payload = (await response.json()) as {
        configured?: boolean;
        durationSeconds?: number;
        distanceMeters?: number;
        provider?: string;
        error?: string;
      };
      if (payload.configured === false) {
        setTravel({ status: "unconfigured" });
        return;
      }
      if (!response.ok || typeof payload.durationSeconds !== "number") {
        setTravel({
          status: "error",
          message:
            payload.error?.trim() || "Travel time could not be calculated.",
        });
        return;
      }
      setTravel({
        status: "ready",
        durationSeconds: payload.durationSeconds,
        distanceMeters: payload.distanceMeters ?? 0,
        provider: payload.provider ?? "routing",
      });
    } catch {
      setTravel({
        status: "error",
        message: "Travel time could not be calculated.",
      });
    }
  }, [fromMarker, toMarker]);

  function chooseCity(next: CityFilter) {
    setCity(next);
    setActiveId(null);
    setTravelFrom("");
    setTravelTo("");
    resetTravel();
  }

  function chooseCategory(next: CategoryFilter) {
    setCategory(next);
    setActiveId(null);
    setTravelFrom("");
    setTravelTo("");
    resetTravel();
  }

  function chooseDate(next: string) {
    setDate(next);
    setActiveId(null);
    setTravelFrom("");
    setTravelTo("");
    resetTravel();
  }

  function showPin(id: string) {
    setActiveId(id);
    document
      .querySelector("#map .map-frame")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  const cityEmpty =
    city !== "all" &&
    markersState.status === "ready" &&
    !records.some((m) => m.city === city) &&
    focusCities.includes(city as (typeof focusCities)[number]);

  const noPinsInFilter =
    markersState.status === "ready" && records.length > 0 && filtered.length === 0;

  return (
    <section id="map" className={sectionClassCompact}>
      <style>{mapStyles}</style>
      <div className="map-stage">
        <div className="map-lead">
          <SectionIntro
            kicker="Map"
            title="Filter by city"
            lede="Drop into Lagos, Abuja, Accra, or Abidjan. Pins come only from places, events, and coordinates already on file — hotels, venues, and parties colour-coded by confirmed event date."
          />
          <p className="mb-6 max-w-2xl text-sm leading-6 text-muted">
            Explore map search stays separate for third-party OpenStreetMap lookups.{" "}
            <Link
              href="/explore"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Explore map search
            </Link>
          </p>
          {markersState.status === "error" ? (
            <ErrorNote message="The map did not load." onRetry={markersState.retry} />
          ) : null}
          {markersState.status === "ready" && records.length === 0 ? (
            <EmptyList href="/list#submit-place" cta="List a place">
              No verified coordinates are listed for these cities yet.
            </EmptyList>
          ) : null}
          {cityEmpty ? (
            <EmptyList href="/places" cta="Browse places">
              No verified pins are on file for {city} yet.
            </EmptyList>
          ) : null}
        </div>
        {markersState.status === "ready" && records.length > 0 && !cityEmpty ? (
          <div className="map-filters mb-4 space-y-5">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
                {filtered.length} {filtered.length === 1 ? "pin" : "pins"}
              </p>
              <p className="mt-2 text-sm text-muted">
                Cities on file with coordinates: {focusCities.join(", ")}.
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">City</p>
              <div
                role="radiogroup"
                aria-label="City"
                className="mt-2 -mx-5 flex w-full min-w-0 gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={city === "all"}
                  className="chip"
                  onClick={() => chooseCity("all")}
                >
                  All
                </button>
                {focusCities.map((name) => (
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
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Category</p>
              <div
                role="radiogroup"
                aria-label="Category"
                className="mt-2 flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={category === "all"}
                  className="chip"
                  onClick={() => chooseCategory("all")}
                >
                  All
                </button>
                {(Object.keys(MAP_FILTER_GROUP_LABELS) as MapFilterGroup[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={category === key}
                    className="chip"
                    onClick={() => chooseCategory(key)}
                  >
                    {MAP_FILTER_GROUP_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
            {dateOptions.length > 0 ? (
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  Event date
                </p>
                <div
                  role="radiogroup"
                  aria-label="Event date"
                  className="mt-2 flex flex-wrap gap-2"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={date === ""}
                    className="chip"
                    onClick={() => chooseDate("")}
                  >
                    All dates
                  </button>
                  {dateOptions.map((iso) => (
                    <button
                      key={iso}
                      type="button"
                      role="radio"
                      aria-checked={date === iso}
                      className="chip"
                      onClick={() => chooseDate(iso)}
                    >
                      {iso.slice(8, 10)} Dec
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {markersState.status === "loading" ? (
          <div className="map-column">
            <div className={mapFrameClass} role="region" aria-label="Map">
              <MapSkeleton />
            </div>
          </div>
        ) : null}
        {markersState.status === "ready" && records.length > 0 && !cityEmpty ? (
          <div className="map-column">
            <div
              className={`${mapFrameClass} relative`}
              role="region"
              aria-label="OpenStreetMap of sourced pins"
            >
              {filtered.length > 0 ? (
                <CircuitMap
                  pins={circuitPins}
                  activeId={activeId}
                  onSelect={showPin}
                  listHref="/places"
                />
              ) : (
                <div className="flex h-full items-center px-4">
                  <p className="text-base text-muted">
                    {noPinsInFilter
                      ? "No pins match these filters."
                      : `No pins for ${city}.`}
                  </p>
                </div>
              )}
              {active ? (
                <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-4.5rem)] border border-ink bg-paper px-3 py-3 md:max-w-sm">
                  {active.href ? (
                    <Link
                      href={active.href}
                      className="text-lg leading-6 underline decoration-oxide/60 decoration-1 underline-offset-4"
                    >
                      {active.name}
                    </Link>
                  ) : active.url ? (
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
                    {active.category} · {active.city}, {active.country}
                  </p>
                  {active.when ? (
                    <p className="mt-1 font-mono text-[13px] text-muted">{active.when}</p>
                  ) : null}
                  <a
                    href={directionsHref(active)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-lagoon underline decoration-1 underline-offset-4"
                  >
                    Directions — leaves this site
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {markersState.status === "ready" && eventMarkers.length >= 2 ? (
        <div className="mt-8 border border-line bg-paper-deep/40 px-4 py-5 md:px-6">
          <h3 className="font-display text-2xl tracking-tight">Travel between events</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Pick two confirmed events that already have venue coordinates. Times come from
            a configured routing key only — never guessed.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted">From</span>
              <select
                className="ledger-input mt-2 w-full"
                value={travelFrom}
                onChange={(event) => {
                  setTravelFrom(event.target.value);
                  resetTravel();
                }}
              >
                <option value="">Choose event</option>
                {eventMarkers.map((marker) => (
                  <option key={marker.id} value={marker.id}>
                    {marker.when} — {marker.name} ({marker.city})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted">To</span>
              <select
                className="ledger-input mt-2 w-full"
                value={travelTo}
                onChange={(event) => {
                  setTravelTo(event.target.value);
                  resetTravel();
                }}
              >
                <option value="">Choose event</option>
                {eventMarkers.map((marker) => (
                  <option key={marker.id} value={marker.id}>
                    {marker.when} — {marker.name} ({marker.city})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <TravelTimeBar
            travel={travel}
            fromMarker={fromMarker}
            toMarker={toMarker}
            onCalculate={() => void fetchTravelTime()}
          />
        </div>
      ) : null}

      {markersState.status === "ready" && filtered.length > 0 ? (
        <LoadMoreList items={filtered} mobileSize={8} desktopSize={14} noun="pins">
          {(visible) => (
            <ul className="pin-list mt-8 border-t border-line lg:max-h-[min(68vh,640px)] lg:overflow-auto lg:border lg:px-3">
              {visible.map((marker) => {
                const selected = marker.id === activeId;
                return (
                  <li key={marker.id} className="border-b border-line py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full align-middle"
                          style={{ backgroundColor: marker.pinColor }}
                          aria-hidden
                        />
                        {marker.href ? (
                          <Link
                            href={marker.href}
                            className="leading-6 underline decoration-oxide/50 decoration-1 underline-offset-4"
                          >
                            {marker.name}
                          </Link>
                        ) : marker.url ? (
                          <a
                            href={marker.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="leading-6 underline decoration-oxide/50 decoration-1 underline-offset-4"
                          >
                            {marker.name}
                          </a>
                        ) : (
                          <p className="leading-6">{marker.name}</p>
                        )}
                        <p className="mt-1 text-sm text-muted">
                          {marker.category} · {marker.city}
                          {marker.when ? ` · ${marker.when}` : ""}
                        </p>
                        <button
                          type="button"
                          onClick={() => showPin(marker.id)}
                          aria-pressed={selected}
                          className="mt-1 block text-left font-mono text-[13px] uppercase tracking-[0.08em] text-muted"
                        >
                          Show on map
                        </button>
                      </div>
                      <a
                        href={directionsHref(marker)}
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
          )}
        </LoadMoreList>
      ) : null}
    </section>
  );
}

function TravelTimeBar({
  travel,
  fromMarker,
  toMarker,
  onCalculate,
}: {
  travel: TravelState;
  fromMarker: MapMarker | null;
  toMarker: MapMarker | null;
  onCalculate: () => void;
}) {
  const canCalculate = Boolean(fromMarker && toMarker && fromMarker.id !== toMarker.id);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        disabled={!canCalculate || travel.status === "loading"}
        className="bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-chart disabled:opacity-50"
        onClick={onCalculate}
      >
        {travel.status === "loading" ? "Calculating…" : "Calculate travel time"}
      </button>
      <div className="text-sm leading-6 text-ink">
        {travel.status === "unconfigured" ? (
          <p>
            Routing key not set. Add{" "}
            <code className="text-xs">OPENROUTESERVICE_API_KEY</code> or{" "}
            <code className="text-xs">MAPBOX_ACCESS_TOKEN</code> on the server to
            estimate drive time here.
          </p>
        ) : null}
        {travel.status === "ready" ? (
          <p>
            About {formatDuration(travel.durationSeconds)} drive (
            {Math.round(travel.distanceMeters / 1000)} km) via {travel.provider}.
          </p>
        ) : null}
        {travel.status === "error" ? (
          <p className="text-oxide">{travel.message}</p>
        ) : null}
      </div>
      {fromMarker && toMarker ? (
        <a
          href={osmRouteHref(fromMarker, toMarker)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-lagoon underline decoration-1 underline-offset-4"
        >
          Open route in OpenStreetMap — leaves this site
        </a>
      ) : null}
    </div>
  );
}