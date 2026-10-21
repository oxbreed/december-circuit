"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Pin } from "../pins";
import { pinId } from "./pin-id";

function FitBounds({ pins, signature }: { pins: Pin[]; signature: string }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    map.fitBounds(
      pins.map((pin) => [pin.latitude, pin.longitude] as [number, number]),
      { padding: [28, 28], maxZoom: 12 },
    );
  }, [map, pins, signature]);
  return null;
}

function FocusPin({ pin }: { pin: Pin | null }) {
  const map = useMap();
  useEffect(() => {
    if (!pin) return;
    map.setView([pin.latitude, pin.longitude], Math.max(map.getZoom(), 14), {
      animate: true,
    });
  }, [map, pin]);
  return null;
}

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(id);
  }, [map]);
  return null;
}

export default function CircuitMap({
  pins,
  activeId,
  onSelect,
}: {
  pins: Pin[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (pins.length === 0) return null;
  const signature = pins
    .map((pin) => `${pin.latitude},${pin.longitude},${pin.name}`)
    .join(";");
  const active = pins.find((pin) => pinId(pin) === activeId) ?? null;
  const ordered = [...pins].sort((a, b) => {
    if (pinId(a) === activeId) return 1;
    if (pinId(b) === activeId) return -1;
    return 0;
  });

  return (
    <MapContainer
      center={[pins[0].latitude, pins[0].longitude]}
      zoom={5}
      minZoom={2}
      maxZoom={18}
      zoomControl={false}
      scrollWheelZoom
      className="h-full w-full"
    >
      <ZoomControl position="topright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <InvalidateSize />
      <FitBounds pins={pins} signature={signature} />
      <FocusPin pin={active} />
      {ordered.map((pin) => {
        const id = pinId(pin);
        const selected = id === activeId;
        return (
          <CircleMarker
            key={id}
            center={[pin.latitude, pin.longitude]}
            radius={selected ? 9 : 6}
            pathOptions={{
              color: selected ? "#f6f1e7" : "#e4c98a",
              weight: selected ? 2 : 1.5,
              fillColor: selected ? "#e4c98a" : "#10151f",
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => onSelect(id) }}
          >
            <Tooltip>{pin.name}</Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
