export const disclaimer =
  "Independent community directory. Not affiliated with Livespot360 or Detty December Fest™.";

/** Primary header destinations — scannable “where to go” set. */
export const navPrimary = [
  ["Events", "/events"],
  ["Places", "/places"],
  ["Guides", "/guides"],
  ["Visa", "/visa"],
] as const;

/** Secondary tools kept in header and footer; trimmed on the mobile bar. */
export const navSecondary = [
  ["Guide", "/guide"],
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

/** Extra footer destinations kept out of the 7-column mobile bar. */
export const footerExtra = [
  ["Detty December", "/detty-december"],
  ["West Africa", "/west-africa"],
  ["Season guides", "/guides"],
  ["Cities", "/cities"],
  ["Visa", "/visa"],
  ["Explore", "/explore"],
  ["News", "/news"],
  ["FAQ", "/faq"],
  ["List an event or place", "/list"],
] as const;
