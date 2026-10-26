"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LngLatBounds,
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  type GeoJSONSource,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { Pin } from "../pins";
import { OPENFREEMAP_STYLE_URL } from "../map-style";
import { ensureMapLibreWorker } from "../maplibre-setup";
import { pinId } from "./pin-id";
import {
  MapErrorBoundary,
  MapFallback,
  centerFromPoints,
  forceMapFallbackFromQuery,
  useMapReadyTimeout,
  type MapListHref,
} from "./map-fallback";

type PinProps = { id: string; name: string; selected: 0 | 1 };
type PinFeature = Feature<Point, PinProps>;

function pinsToFeatureCollection(
  pins: Pin[],
  activeId: string | null,
): FeatureCollection<Point, PinProps> {
  const ordered = [...pins].sort((a, b) => {
    if (pinId(a) === activeId) return 1;
    if (pinId(b) === activeId) return -1;
    return 0;
  });
  return {
    type: "FeatureCollection",
    features: ordered.map((pin): PinFeature => {
      const id = pinId(pin);
      return {
        type: "Feature",
        id,
        properties: {
          id,
          name: pin.name,
          selected: id === activeId ? 1 : 0,
        },
        geometry: {
          type: "Point",
          coordinates: [pin.longitude, pin.latitude],
        },
      };
    }),
  };
}

function fitPins(map: MapLibreMap, pins: Pin[], narrow: boolean) {
  if (pins.length === 0) return;
  if (pins.length === 1) {
    map.jumpTo({
      center: [pins[0].longitude, pins[0].latitude],
      zoom: 12,
    });
    return;
  }
  const bounds = new LngLatBounds();
  for (const pin of pins) {
    bounds.extend([pin.longitude, pin.latitude]);
  }
  map.fitBounds(bounds, {
    padding: narrow
      ? { top: 40, bottom: 52, left: 28, right: 28 }
      : { top: 28, bottom: 28, left: 28, right: 28 },
    maxZoom: 12,
    animate: false,
  });
}

function CircuitMapInner({
  pins,
  activeId,
  onSelect,
  listHref,
}: {
  pins: Pin[];
  activeId: string | null;
  onSelect: (id: string) => void;
  listHref: MapListHref;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const onSelectRef = useRef(onSelect);
  const handedOff = useRef(false);
  const fitting = useRef(false);
  const seenSignature = useRef<string | null>(null);
  const narrow = useNarrowMap();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(() => forceMapFallbackFromQuery());

  onSelectRef.current = onSelect;

  const signature = pins
    .map((pin) => `${pin.latitude},${pin.longitude},${pin.name}`)
    .join(";");

  const markFailed = useCallback(() => {
    setFailed(true);
  }, []);

  useMapReadyTimeout(ready || failed, markFailed);

  useEffect(() => {
    if (failed) return;
    if (!containerRef.current || mapRef.current) return;
    if (pins.length === 0) return;

    let map: MapLibreMap;
    try {
      ensureMapLibreWorker();
      map = new MapLibreMap({
        container: containerRef.current,
        style: OPENFREEMAP_STYLE_URL,
        attributionControl: { compact: true },
        scrollZoom: false,
        minZoom: 2,
        maxZoom: 18,
      });
    } catch (error) {
      console.error("MapLibre circuit map init failed", error);
      markFailed();
      return;
    }

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
      className: "map-pin-tip",
      maxWidth: "14rem",
    });
    popupRef.current = popup;

    const onDragStart = () => {
      handedOff.current = true;
    };
    const onZoomStart = () => {
      if (!fitting.current) handedOff.current = true;
    };
    const onMapError = () => {
      console.error("MapLibre circuit map error");
      markFailed();
    };
    map.on("dragstart", onDragStart);
    map.on("zoomstart", onZoomStart);
    map.on("error", onMapError);

    map.on("load", () => {
      map.addSource("pins", {
        type: "geojson",
        data: pinsToFeatureCollection(pins, activeId),
        promoteId: "id",
      });
      map.addLayer({
        id: "pins-circle",
        type: "circle",
        source: "pins",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "selected"], 1],
            narrow ? 12 : 9,
            narrow ? 9 : 6,
          ],
          "circle-color": ["case", ["==", ["get", "selected"], 1], "#b8432f", "#8a6232"],
          "circle-stroke-width": ["case", ["==", ["get", "selected"], 1], 2, 1.5],
          "circle-stroke-color": [
            "case",
            ["==", ["get", "selected"], 1],
            "#1a1410",
            "#1b684e",
          ],
        },
      });

      map.on("mouseenter", "pins-circle", (event: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = "pointer";
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;
        const name = String(feature.properties?.name ?? "");
        const [lng, lat] = feature.geometry.coordinates as [number, number];
        popup.setLngLat([lng, lat]).setText(name).addTo(map);
      });
      map.on("mouseleave", "pins-circle", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
      map.on("click", "pins-circle", (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        const id = feature?.properties?.id;
        if (typeof id === "string") onSelectRef.current(id);
      });

      fitting.current = true;
      fitPins(map, pins, narrow);
      fitting.current = false;
      seenSignature.current = signature;
      setReady(true);
    });

    return () => {
      map.off("dragstart", onDragStart);
      map.off("zoomstart", onZoomStart);
      map.off("error", onMapError);
      popup.remove();
      map.remove();
      mapRef.current = null;
      popupRef.current = null;
      setReady(false);
    };
    // Mount once; pin updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failed]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || failed) return;

    const source = map.getSource("pins") as GeoJSONSource | undefined;
    if (source) {
      source.setData(pinsToFeatureCollection(pins, activeId));
    }

    if (map.getLayer("pins-circle")) {
      map.setPaintProperty("pins-circle", "circle-radius", [
        "case",
        ["==", ["get", "selected"], 1],
        narrow ? 12 : 9,
        narrow ? 9 : 6,
      ]);
    }

    if (seenSignature.current !== signature) {
      seenSignature.current = signature;
      handedOff.current = false;
    }

    const frame = containerRef.current?.closest(".map-frame") ?? containerRef.current;
    if (!frame) return;

    const station = () => {
      const box = frame.getBoundingClientRect();
      if (box.height < 1 || box.width < 1) return;
      map.resize();
      const canvas = map.getCanvas();
      if (canvas.clientWidth < 1 || canvas.clientHeight < 1) return;
      if (!handedOff.current) {
        fitting.current = true;
        fitPins(map, pins, narrow);
        fitting.current = false;
      }
    };

    station();
    const observer = new ResizeObserver(() => station());
    observer.observe(frame);
    if (containerRef.current && containerRef.current !== frame) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [pins, signature, activeId, narrow, ready, failed]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || failed || !activeId) return;
    const active = pins.find((pin) => pinId(pin) === activeId);
    if (!active) return;
    handedOff.current = true;
    map.easeTo({
      center: [active.longitude, active.latitude],
      zoom: Math.max(map.getZoom(), 14),
      duration: 450,
    });
  }, [activeId, pins, ready, failed]);

  if (pins.length === 0) return null;

  const center = centerFromPoints(pins);

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

export default function CircuitMap({
  pins,
  activeId,
  onSelect,
  /** Circuit / event surfaces → /events; place pin maps may pass /places. */
  listHref = "/events",
}: {
  pins: Pin[];
  activeId: string | null;
  onSelect: (id: string) => void;
  listHref?: MapListHref;
}) {
  const center = centerFromPoints(pins);
  return (
    <MapErrorBoundary listHref={listHref} center={center}>
      <CircuitMapInner
        pins={pins}
        activeId={activeId}
        onSelect={onSelect}
        listHref={listHref}
      />
    </MapErrorBoundary>
  );
}

function useNarrowMap() {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 1023px)").matches
      : false,
  );
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const apply = () => setNarrow(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return narrow;
}
