"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  isGooglePlacesKind,
  poiCities,
  poiKindFilters,
  poiKinds,
  type PoiCity,
  type PoiKind,
  type PoiResult,
  type PoiSource,
} from "../poi-client";
import { SectionIntro, sectionClassCompact } from "./section-intro";
import { EmptyNote, ErrorNote, LoadingLines } from "./states";

const PoiMap = dynamic(() => import("./poi-map"), {
  ssr: false,
  loading: () => (
    <div className="map-skeleton h-full min-h-48 w-full" aria-busy="true">
      <span className="sr-only">Map</span>
    </div>
  ),
});

type ExploreState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      results: PoiResult[];
      sources: PoiSource[];
      foursquareEnabled: boolean;
      googlePlacesEnabled: boolean;
    };

function isPoiSource(value: unknown): value is PoiSource {
  return value === "openstreetmap" || value === "foursquare" || value === "google";
}

function parseCity(value: string | null): PoiCity {
  if (value && (poiCities as readonly string[]).includes(value)) {
    return value as PoiCity;
  }
  return "Lagos";
}

function parseKind(value: string | null): PoiKind {
  if (value && (poiKinds as readonly string[]).includes(value)) {
    return value as PoiKind;
  }
  return "hotels";
}

function sourceLabel(sources: PoiSource[]): string {
  const parts: string[] = [];
  if (sources.includes("openstreetmap")) parts.push("OpenStreetMap");
  if (sources.includes("foursquare")) parts.push("Foursquare");
  if (sources.includes("google")) parts.push("Google");
  return parts.length ? parts.join(" · ") : "OpenStreetMap";
}

const mapFrameClass =
  "map-frame relative h-[min(42vh,320px)] min-h-48 border border-ink/20 shadow-[6px_6px_0_0_rgba(138,98,50,0.18)] lg:h-[360px]";

export function ExploreFallback() {
  return (
    <section id="explore" className={sectionClassCompact}>
      <SectionIntro
        kicker="Explore"
        title="OpenStreetMap search"
        lede="Map points to help plan a stay. Checked listings stay on Places and Events."
      />
      <LoadingLines label="Loading map search" />
    </section>
  );
}

export function ExploreSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const city = parseCity(searchParams.get("city"));
  const kind = parseKind(searchParams.get("kind"));
  const qParam = searchParams.get("q")?.trim() ?? "";
  const [draftQ, setDraftQ] = useState(qParam);
  const [state, setState] = useState<ExploreState>({ status: "loading" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setDraftQ(qParam);
  }, [qParam]);

  const replaceQuery = useCallback(
    (patch: { city?: string; kind?: string; q?: string }) => {
      const params = new URLSearchParams();
      const nextCity = patch.city ?? city;
      const nextKind = patch.kind ?? kind;
      const nextQ = patch.q !== undefined ? patch.q : qParam;
      if (nextCity !== "Lagos") params.set("city", nextCity);
      if (nextKind !== "hotels") params.set("kind", nextKind);
      if (nextQ.trim()) params.set("q", nextQ.trim());
      const qs = params.toString();
      router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
    },
    [city, kind, qParam, router],
  );

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    setActiveId(null);
    const params = new URLSearchParams({ city, kind });
    if (qParam) params.set("q", qParam);
    fetch(`/api/poi?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as {
          results?: PoiResult[];
          sources?: PoiSource[];
          foursquareEnabled?: boolean;
          googlePlacesEnabled?: boolean;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error?.trim() || "OpenStreetMap search failed.");
        }
        return {
          results: Array.isArray(payload.results) ? payload.results : [],
          sources: Array.isArray(payload.sources)
            ? payload.sources.filter(isPoiSource)
            : (["openstreetmap"] as PoiSource[]),
          foursquareEnabled: Boolean(payload.foursquareEnabled),
          googlePlacesEnabled: Boolean(payload.googlePlacesEnabled),
        };
      })
      .then(({ results, sources, foursquareEnabled, googlePlacesEnabled }) => {
        if (controller.signal.aborted) return;
        setState({
          status: "ready",
          results,
          sources,
          foursquareEnabled,
          googlePlacesEnabled,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error && error.message
            ? error.message
            : "OpenStreetMap search did not finish.";
        setState({ status: "error", message });
      });
    return () => controller.abort();
  }, [city, kind, qParam, attempt]);

  const active = useMemo(() => {
    if (state.status !== "ready" || !activeId) return null;
    return state.results.find((row) => row.id === activeId) ?? null;
  }, [state, activeId]);

  function submitNameFilter(event: FormEvent) {
    event.preventDefault();
    replaceQuery({ q: draftQ });
  }

  const hasFoursquareResults =
    state.status === "ready" && state.sources.includes("foursquare");
  const hasGoogleResults =
    state.status === "ready" && state.sources.includes("google");
  const thirdPartyNames = [
    hasFoursquareResults ? "Foursquare" : null,
    hasGoogleResults ? "Google" : null,
  ].filter(Boolean);

  return (
    <section id="explore" className={sectionClassCompact}>
      <style>{`
        .map-skeleton {
          background:
            radial-gradient(circle at 32% 42%, rgba(27, 104, 78, 0.16), transparent 26%),
            radial-gradient(circle at 68% 62%, rgba(138, 98, 50, 0.2), transparent 18%),
            #e7dfd2;
        }
      `}</style>
      <SectionIntro
        kicker="Explore"
        title="OpenStreetMap search"
        lede="These are map and third-party venue points to help plan hotels, short stays, meals, shopping, car hire, nights out, and landmarks. Checked stays and events remain on Places and Events."
      />

      <div className="mb-8 max-w-2xl border border-brass/40 bg-paper-deep/50 px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
          Map / third-party venue data
        </p>
        <p className="mt-2 text-sm leading-6 text-ink">
          Not a checked listing. Names and coordinates come from OpenStreetMap
          {thirdPartyNames.length > 0 ? ` and ${thirdPartyNames.join(" and ")}` : ""}
          . Address, website, phone, and opening hours appear only when that source
          already has them — this site does not invent phones, prices, ratings, or hours.
          Optional Google Places results (when configured) cover lodging, restaurants,
          shopping, car hire, and nightlife types with attribution, and open on Google
          Maps — there is no on-site booking or payment, and no Google or Airbnb scrape.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Know a business that should be reviewed for the directory?{" "}
          <Link
            href="/list#submit-place"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            List a place
          </Link>
          .
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">City</p>
          <div
            role="radiogroup"
            aria-label="City"
            className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0"
          >
            {poiCities.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={city === name}
                className="chip"
                onClick={() => replaceQuery({ city: name })}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">Looking for</p>
          <div
            role="radiogroup"
            aria-label="Place type"
            className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0"
          >
            {poiKinds.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={kind === key}
                className="chip"
                onClick={() => replaceQuery({ kind: key })}
              >
                {poiKindFilters[key].label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submitNameFilter} className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
              Name filter
            </span>
            <input
              type="search"
              value={draftQ}
              onChange={(event) => setDraftQ(event.target.value)}
              placeholder="Optional — filter by name"
              className="mt-2 w-full border border-ink/20 bg-chart px-3 py-2.5 text-sm text-ink placeholder:text-muted/70"
              autoComplete="off"
            />
          </label>
          <button
            type="submit"
            className="shrink-0 bg-ink px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-chart"
          >
            Apply
          </button>
        </form>
      </div>

      {state.status === "loading" ? <LoadingLines label="Searching OpenStreetMap" /> : null}
      {state.status === "error" ? (
        <ErrorNote message={state.message} onRetry={() => setAttempt((n) => n + 1)} />
      ) : null}
      {state.status === "ready" && state.results.length === 0 ? (
        <EmptyNote>
          No map {poiKindFilters[kind].label.toLowerCase()} matched in {city}
          {qParam ? ` for “${qParam}”` : ""}. Try another type, clear the name filter, or{" "}
          <Link
            href="/list#submit-place"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            submit a place for review
          </Link>
          .
        </EmptyNote>
      ) : null}

      {state.status === "ready" && state.results.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
              {state.results.length}{" "}
              {state.results.length === 1 ? "result" : "results"} · {city}
            </p>
            <ul className="mt-4 divide-y divide-ink/10 border border-ink/15 bg-chart/60">
              {state.results.map((row) => {
                const selected = row.id === activeId;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(selected ? null : row.id)}
                      aria-pressed={selected}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        selected ? "bg-paper-deep" : "hover:bg-paper-deep/50"
                      }`}
                    >
                      <span className="block font-display text-xl leading-tight tracking-tight text-ink">
                        {row.name}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-muted">
                        {row.category}
                        {row.area ? ` · ${row.area}` : ""}
                        {row.address ? ` · ${row.address}` : ""} · {row.city}
                      </span>
                      <span className="mt-1 block font-mono text-[12px] text-muted">
                        {sourceLabel(row.sources)} · {row.latitude.toFixed(5)},{" "}
                        {row.longitude.toFixed(5)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:sticky lg:top-36">
            <div className={mapFrameClass} role="region" aria-label="Selected venue on the map">
              {active ? (
                <PoiMap
                  point={{
                    id: active.id,
                    name: active.name,
                    latitude: active.latitude,
                    longitude: active.longitude,
                  }}
                  listHref="/places"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4">
                  <p className="max-w-xs text-center text-sm leading-6 text-muted">
                    Select a result to show it on the map.
                  </p>
                </div>
              )}
            </div>
            {active ? (
              <div className="mt-4 border border-ink/15 bg-chart px-4 py-4">
                <p className="font-display text-2xl leading-none tracking-tight">{active.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {active.category}
                  {active.area ? ` · ${active.area}` : ""} · {active.city}
                </p>
                {active.address ? (
                  <p className="mt-2 text-sm leading-6 text-ink">{active.address}</p>
                ) : null}
                {active.openingHours ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Hours (OpenStreetMap): {active.openingHours}
                  </p>
                ) : null}
                {active.phone ? (
                  <p className="mt-2 text-sm leading-6 text-ink">
                    <a
                      href={`tel:${active.phone.replace(/\s+/g, "")}`}
                      className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                    >
                      {active.phone}
                    </a>
                  </p>
                ) : null}
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-brass">
                  Map / third-party data · {sourceLabel(active.sources)}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  {active.osmUrl ? (
                    <a
                      href={active.osmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                    >
                      Open on OpenStreetMap
                    </a>
                  ) : null}
                  {active.googleMapsUrl ? (
                    <a
                      href={active.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                    >
                      Open on Google Maps
                    </a>
                  ) : null}
                  {active.website ? (
                    <a
                      href={active.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                    >
                      Website
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {state.status === "ready" ? (
        <p className="mt-8 max-w-2xl text-sm leading-6 text-muted">
          Attribution: ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            OpenStreetMap
          </a>{" "}
          contributors (ODbL)
          {state.sources.includes("foursquare") ? (
            <>
              {" "}
              · Venue data ©{" "}
              <a
                href="https://foursquare.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                Foursquare
              </a>
            </>
          ) : state.foursquareEnabled ? (
            <> · Foursquare is configured but returned no matches for this search.</>
          ) : null}
          {state.sources.includes("google") ? (
            <>
              {" "}
              · Place data{" "}
              <a
                href="https://developers.google.com/maps/documentation/places/web-service/policies"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                powered by Google
              </a>
            </>
          ) : state.googlePlacesEnabled && isGooglePlacesKind(kind) ? (
            <>
              {" "}
              · Google Places is configured but returned no matches for this{" "}
              {poiKindFilters[kind].label.toLowerCase()} search.
            </>
          ) : null}
          .
        </p>
      ) : null}

      <p className="mt-6 max-w-2xl text-sm leading-6 text-muted">
        Verified organiser pages stay on{" "}
        <Link href="/places" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Places
        </Link>
        . Sourced pins stay on the{" "}
        <Link href="/map" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Map
        </Link>
        .
      </p>
    </section>
  );
}
