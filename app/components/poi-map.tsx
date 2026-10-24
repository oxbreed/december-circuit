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

export type PoiMapPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

function RevealAndFocus({ point }: { point: PoiMapPoint }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize({ animate: false });
    map.setView([point.latitude, point.longitude], 15, { animate: false });
    map.getContainer().style.visibility = "visible";
  }, [map, point.id, point.latitude, point.longitude]);
  return null;
}

export default function PoiMap({ point }: { point: PoiMapPoint }) {
  return (
    <MapContainer
      center={[point.latitude, point.longitude]}
      zoom={15}
      minZoom={2}
      maxZoom={18}
      className="h-full w-full"
      scrollWheelZoom={false}
      zoomControl={false}
      style={{ visibility: "hidden" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />
      <RevealAndFocus point={point} />
      <CircleMarker
        center={[point.latitude, point.longitude]}
        radius={9}
        pathOptions={{
          color: "#1a1410",
          weight: 2,
          fillColor: "#b8432f",
          fillOpacity: 1,
        }}
      >
        <Tooltip direction="top" offset={[0, -8]} opacity={1}>
          {point.name}
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
