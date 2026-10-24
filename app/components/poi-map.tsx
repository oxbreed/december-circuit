"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, NavigationControl, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_ATTRIBUTION, OPENFREEMAP_STYLE_URL } from "../map-style";

export type PoiMapPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function PoiMap({ point }: { point: PoiMapPoint }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: OPENFREEMAP_STYLE_URL,
      center: [point.longitude, point.latitude],
      zoom: 15,
      attributionControl: {
        compact: true,
        customAttribution: MAP_ATTRIBUTION,
      },
      scrollZoom: false,
      minZoom: 2,
      maxZoom: 18,
    });
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
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const popup = popupRef.current;
    if (!map || !marker || !popup || !ready) return;
    map.resize();
    map.jumpTo({ center: [point.longitude, point.latitude], zoom: 15 });
    marker.setLngLat([point.longitude, point.latitude]);
    popup.setText(point.name);
    const el = marker.getElement();
    el.setAttribute("aria-label", point.name);
  }, [point.id, point.latitude, point.longitude, point.name, ready]);

  return (
    <div
      ref={containerRef}
      className="maplibre-map h-full w-full"
      style={{ visibility: ready ? "visible" : "hidden" }}
    />
  );
}
