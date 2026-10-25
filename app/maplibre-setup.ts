"use client";

import { setWorkerUrl } from "maplibre-gl";

let configured = false;

/**
 * MapLibre under Next must use a same-origin worker URL.
 *
 * A CDN (cross-origin) `.mjs` URL makes MapLibre wrap the worker in a blob
 * `import` shim and revoke that blob before the worker finishes loading —
 * console: "Worker failed to load" + `blob:… net::ERR_FILE_NOT_FOUND`.
 * Serve `public/maplibre-gl-worker.mjs` (synced from the installed package).
 */
export function ensureMapLibreWorker() {
  if (configured || typeof window === "undefined") return;
  setWorkerUrl(`${window.location.origin}/maplibre-gl-worker.mjs`);
  configured = true;
}
