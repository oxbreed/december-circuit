"use client";

import Link from "next/link";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { MAP_ATTRIBUTION } from "../map-style";

/** Where “View as list” should land when the interactive map fails. */
export type MapListHref = "/events" | "/places" | "/explore";

export type MapFallbackCenter = {
  latitude: number;
  longitude: number;
  /** Optional OSM/Wikimedia zoom; keep modest for overview. */
  zoom?: number;
};

const FALLBACK_READY_MS = 10_000;

/**
 * QA only: `?mapFallback=1` forces the static fallback UI without waiting for
 * a real MapLibre failure. Production traffic never sets this.
 */
export function forceMapFallbackFromQuery(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("mapFallback") === "1";
  } catch {
    return false;
  }
}

/**
 * Same-origin static OSM preview from real coordinates only
 * (`/api/static-map` proxies one OpenStreetMap raster tile).
 * Never call with invented lat/lng — pass sourced pin or POI points.
 */
export function staticMapImageUrl(center: MapFallbackCenter): string {
  const zoom = Math.min(16, Math.max(3, Math.round(center.zoom ?? 11)));
  const lat = Number(center.latitude.toFixed(5));
  const lon = Number(center.longitude.toFixed(5));
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    z: String(zoom),
  });
  return `/api/static-map?${params.toString()}`;
}

export function centerFromPoints(
  points: ReadonlyArray<{ latitude: number; longitude: number }>,
): MapFallbackCenter | null {
  if (points.length === 0) return null;
  let lat = 0;
  let lon = 0;
  for (const point of points) {
    lat += point.latitude;
    lon += point.longitude;
  }
  return {
    latitude: lat / points.length,
    longitude: lon / points.length,
    zoom: points.length === 1 ? 14 : 10,
  };
}

export function MapFallback({
  listHref,
  center,
  message = "The interactive map could not load.",
}: {
  listHref: MapListHref;
  center: MapFallbackCenter | null;
  message?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const listLabel =
    listHref === "/events"
      ? "View as list — Events"
      : listHref === "/places"
        ? "View as list — Places"
        : "View as list — Explore";

  const src = center && !imageFailed ? staticMapImageUrl(center) : null;

  return (
    <div
      className="map-fallback relative flex h-full min-h-48 w-full flex-col justify-end overflow-hidden"
      role="region"
      aria-label="Map unavailable"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- same-origin static tile; object-fit fills the frame
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="map-skeleton absolute inset-0" aria-hidden="true" />
      )}
      {src ? (
        <span
          className="pointer-events-none absolute left-1/2 top-[42%] z-[1] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-oxide shadow-[0_0_0_3px_rgba(26,20,16,0.12)]"
          aria-hidden="true"
        />
      ) : null}
      <div
        className="absolute inset-0 bg-gradient-to-t from-paper via-paper/70 to-paper/10"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col gap-3 p-4 md:max-w-md md:p-5">
        <p className="text-base leading-6 text-ink">{message}</p>
        <p className="text-sm leading-6 text-muted">
          Browse the directory as a list instead. Sourced coordinates stay on
          Places; confirmed dates stay on Events.
        </p>
        <Link
          href={listHref}
          className="inline-flex w-fit items-center bg-ink px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-chart"
        >
          {listLabel}
        </Link>
        <p className="font-mono text-[10px] leading-4 tracking-[0.04em] text-muted">
          {MAP_ATTRIBUTION}
        </p>
      </div>
    </div>
  );
}

type BoundaryProps = {
  children: ReactNode;
  listHref: MapListHref;
  center: MapFallbackCenter | null;
};

type BoundaryState = { failed: boolean };

/** Catches render/init throws from MapLibre so the page never blanks. */
export class MapErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("MapLibre map failed", error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <MapFallback listHref={this.props.listHref} center={this.props.center} />
      );
    }
    return this.props.children;
  }
}

/** Flip to failed if MapLibre never becomes ready (worker / style hang). */
export function useMapReadyTimeout(
  ready: boolean,
  onTimeout: () => void,
  ms: number = FALLBACK_READY_MS,
) {
  useEffect(() => {
    if (ready) return;
    const id = window.setTimeout(onTimeout, ms);
    return () => window.clearTimeout(id);
  }, [ready, onTimeout, ms]);
}
