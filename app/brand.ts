export const disclaimer =
  "Independent community directory. Not affiliated with Livespot360 or Detty December Fest™.";

/** Primary header destinations — scannable “where to go” set. */
export const navPrimary = [
  ["Events", "/events"],
  ["Places", "/places"],
  ["Guides", "/guides"],
  ["Visa", "/visa"],
] as const;

/**
 * Secondary tools. Shown in the footer and the mobile menu, not in the desktop
 * header (that stays: Events, Places, Guides, Visa, search, My trip).
 * `/guide` is kept as "Travel guide" so it is not confused with "Guides".
 */
export const navSecondary = [
  ["Travel guide", "/guide"],
  ["Flights", "/flights"],
  ["Map", "/map"],
  ["About", "/about"],
] as const;

/** Flat list for pages that still expect a single nav array (search, tests). */
export const nav = [
  ["Home", "/"],
  ...navPrimary,
  ...navSecondary,
] as const;
