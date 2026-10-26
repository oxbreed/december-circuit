"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, NavigationControl, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { OPENFREEMAP_STYLE_URL } from "../map-style";
import { ensureMapLibreWorker } from "../maplibre-setup";
import {
  MapErrorBoundary,
  MapFallback,
  forceMapFallbackFromQuery,
  useMapReadyTimeout,
  type MapListHref,
} from "./map-fallback";

export type PoiMapPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

function PoiMapInner({
  point,
  listHref,
}: {
  point: PoiMapPoint;
  listHref: MapListHref;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(() => forceMapFallbackFromQuery());

  const markFailed = useCallback(() => {
    setFailed(true);
  }, []);

  useMapReadyTimeout(ready || failed, markFailed);

  useEffect(() => {
    if (failed) return;
    if (!containerRef.current || mapRef.current) return;

    let map: MapLibreMap;
    try {
      ensureMapLibreWorker();
      map = new MapLibreMap({
        container: containerRef.current,
        style: OPENFREEMAP_STYLE_URL,
        center: [point.longitude, point.latitude],
        zoom: 15,
        attributionControl: { compact: true },
        scrollZoom: false,
        minZoom: 2,
        maxZoom: 18,
      });
    } catch (error) {
      console.error("MapLibre POI map init failed", error);
      markFailed();
      return;
    }

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const popup = new Popup({
      closeButton: false,
      offset: 12,
      className: "map-pin-tip",
      maxWidth: "14rem",
    }).setText(point.name);
    popupRef.current = popup;

    const el = document.createElement("div");
    el.className = "map-poi-marker";
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", point.name);

    const marker = new Marker({ element: el })
      .setLngLat([point.longitude, point.latitude])
      .setPopup(popup)
      .addTo(map);
    markerRef.current = marker;
    popup.addTo(map);

    const onMapError = () => {
      console.error("MapLibre POI map error");
      markFailed();
    };
    map.on("error", onMapError);

    map.on("load", () => {
      map.resize();
      map.jumpTo({ center: [point.longitude, point.latitude], zoom: 15 });
      setReady(true);
    });

    const frame = containerRef.current.closest(".map-frame") ?? containerRef.current;
    const observer = new ResizeObserver(() => {
      map.resize();
    });
    observer.observe(frame);

    return () => {
      observer.disconnect();
      map.off("error", onMapError);
      marker.remove();
      popup.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      popupRef.current = null;
      setReady(false);
    };
    // Mount once; point updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failed]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const popup = popupRef.current;
    if (!map || !marker || !popup || !ready || failed) return;
    map.resize();
    map.jumpTo({ center: [point.longitude, point.latitude], zoom: 15 });
    marker.setLngLat([point.longitude, point.latitude]);
    popup.setText(point.name);
    const el = marker.getElement();
    el.setAttribute("aria-label", point.name);
  }, [point.id, point.latitude, point.longitude, point.name, ready, failed]);

  const center = {
    latitude: point.latitude,
    longitude: point.longitude,
    zoom: 14,
  };

  if (failed) {
    return <MapFallback listHref={listHref} center={center} />;
  }

  return (
    <>
      {!ready ? (
        <div className="map-skeleton absolute inset-0 h-full w-full" aria-busy="true">
          <span className="sr-only">Map</span>
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="maplibre-map h-full w-full"
        style={{ visibility: ready ? "visible" : "hidden" }}
      />
    </>
  );
}

export default function PoiMap({
  point,
  /** Explore / POI surfaces → /explore or /places. */
  listHref = "/explore",
}: {
  point: PoiMapPoint;
  listHref?: MapListHref;
}) {
  const center = {
    latitude: point.latitude,
    longitude: point.longitude,
    zoom: 14,
  };
  return (
    <MapErrorBoundary listHref={listHref} center={center}>
      <PoiMapInner point={point} listHref={listHref} />
    </MapErrorBoundary>
  );
}
