"use client";

import { useEffect, useRef } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import type { FitBoundsOptions, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Pin } from "../pins";
import { pinId } from "./pin-id";

const fitOptions: FitBoundsOptions = {
  padding: [28, 28],
  maxZoom: 12,
  animate: false,
};

function pinBounds(pins: Pin[]): LatLngBoundsExpression {
  return pins.map((pin) => [pin.latitude, pin.longitude]);
}

function frameOf(map: ReturnType<typeof useMap>) {
  const container = map.getContainer();
  return container.closest(".map-frame") ?? container;
}

function StationPins({
  pins,
  signature,
  active,
}: {
  pins: Pin[];
  signature: string;
  active: Pin | null;
}) {
  const map = useMap();
  const handedOff = useRef(false);
  const fitting = useRef(false);
  const seenSignature = useRef<string | null>(null);

  useEffect(() => {
    if (seenSignature.current !== signature) {
      seenSignature.current = signature;
      handedOff.current = false;
    }

    const container = map.getContainer();
    const frame = frameOf(map);

    const station = () => {
      const box = frame.getBoundingClientRect();
      if (box.height < 1 || box.width < 1) return;
      map.invalidateSize({ animate: false });
      const size = map.getSize();
      if (size.x < 1 || size.y < 1) return;
      if (!handedOff.current) {
        fitting.current = true;
        map.fitBounds(pinBounds(pins), fitOptions);
        fitting.current = false;
      }
      container.style.visibility = "visible";
    };

    const onDragStart = () => {
      handedOff.current = true;
    };
    const onZoomStart = () => {
      if (!fitting.current) handedOff.current = true;
    };

    map.on("dragstart", onDragStart);
    map.on("zoomstart", onZoomStart);
    station();

    const observer = new ResizeObserver(() => {
      station();
    });
    observer.observe(frame);
    if (container !== frame) observer.observe(container);

    return () => {
      observer.disconnect();
      map.off("dragstart", onDragStart);
      map.off("zoomstart", onZoomStart);
    };
  }, [map, pins, signature]);

  useEffect(() => {
    if (!active) return;
    handedOff.current = true;
    map.setView([active.latitude, active.longitude], Math.max(map.getZoom(), 14), {
      animate: true,
    });
  }, [map, active]);

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
      bounds={pinBounds(pins)}
      boundsOptions={fitOptions}
      minZoom={2}
      maxZoom={18}
      zoomControl={false}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ visibility: "hidden" }}
    >
      <ZoomControl position="topright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <StationPins pins={pins} signature={signature} active={active} />
      {ordered.map((pin) => {
        const id = pinId(pin);
        const selected = id === activeId;
        return (
          <CircleMarker
            key={id}
            center={[pin.latitude, pin.longitude]}
            radius={selected ? 9 : 6}
            pathOptions={{
              color: selected ? "#1a1410" : "#1b684e",
              weight: selected ? 2 : 1.5,
              fillColor: selected ? "#b8432f" : "#8a6232",
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
