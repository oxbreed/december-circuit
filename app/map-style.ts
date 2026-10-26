/** Free OSM vector basemap — no API key. See docs in the project store. */
export const OPENFREEMAP_STYLE_URL =
  "https://tiles.openfreemap.org/styles/liberty";

/**
 * OpenFreeMap’s style already feeds MapLibre’s attribution control
 * (OpenFreeMap · © OpenMapTiles · OpenStreetMap). Keep this string for docs
 * and any non-MapLibre surface that needs the same credit — including the
 * static map fallback when MapLibre fails to load.
 */
export const MAP_ATTRIBUTION =
  "OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors";
