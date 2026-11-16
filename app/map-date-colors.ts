/** Brand palette for December pin colours (oxide, lagoon, brass, muted ink). */

export const MAP_DATE_PALETTE = [
  "#1b684e",
  "#8a6232",
  "#b8432f",
  "#5c5148",
  "#2d7a5e",
  "#9a6b3a",
  "#c45a42",
  "#3d3530",
] as const;

export const MAP_PLACE_PIN_COLOR = "#8a6232";

/** Colour by calendar day from a sourced ISO date (events only). */
export function colorForIsoDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return MAP_PLACE_PIN_COLOR;
  const day = Number(iso.slice(8, 10));
  if (!Number.isFinite(day) || day < 1) return MAP_PLACE_PIN_COLOR;
  return MAP_DATE_PALETTE[(day - 1) % MAP_DATE_PALETTE.length];
}