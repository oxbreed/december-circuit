export const disclaimer =
  "Independent community directory. Not affiliated with Livespot360 or Detty December Fest™.";

export const nav = [
  ["Home", "/"],
  ["Guide", "/guide"],
  ["Events", "/events"],
  ["Places", "/places"],
  ["Flights", "/flights"],
  ["Map", "/map"],
  ["About", "/about"],
] as const;

/** Extra footer destinations kept out of the 7-column mobile bar. */
export const footerExtra = [
  ["Detty December", "/detty-december"],
  ["West Africa", "/west-africa"],
  ["Cities", "/cities"],
  ["Visa", "/visa"],
  ["Explore", "/explore"],
  ["News", "/news"],
  ["FAQ", "/faq"],
  ["List an event or place", "/list"],
] as const;
