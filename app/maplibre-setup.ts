"use client";

import { getVersion, setWorkerUrl } from "maplibre-gl";

let configured = false;

/** MapLibre's worker must be set explicitly under Next/Turbopack. */
export function ensureMapLibreWorker() {
  if (configured || typeof window === "undefined") return;
  setWorkerUrl(
    `https://cdn.jsdelivr.net/npm/maplibre-gl@${getVersion()}/dist/maplibre-gl-worker.mjs`,
  );
  configured = true;
}
