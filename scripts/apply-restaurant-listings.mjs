/**
 * Sourced West Africa restaurant rows (organiser / hotel dining URLs verified HTTP < 400).
 * Run: node scripts/apply-restaurant-listings.mjs
 */
import fs from "node:fs";

const HELD = new Set([
  "Federal Palace & Casino",
]);

/** Each URL opened in this pass — hotel dining / venue homepages only. */
const pinBacklog = [
  {
    country: "Benin",
    city: "Cotonou",
    category: "Restaurants",
    name: "The Palm",
    url: "https://www.azalai.com/azalai-hotel-cotonou/restaurants",
    source: "restaurant-curated",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Restaurants",
    name: "Akwaaba Restaurant",
    url: "https://labadibeachhotelgh.com/restaurants",
    source: "restaurant-curated",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Restaurants",
    name: "ASANA Bar & Kitchen",
    url: "https://www.kempinski.com/en/hotel-gold-coast-city/restaurants-bars/asana-bar-kitchen",
    source: "restaurant-curated",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Restaurants",
    name: "Papillon Restaurant",
    url: "https://www.kempinski.com/en/hotel-gold-coast-city/restaurants-bars/papillon-restaurant-in-accra",
    source: "restaurant-curated",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Restaurants",
    name: "Santoku",
    url: "https://www.santokuaccra.com/",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Calabar",
    category: "Restaurants",
    name: "Restaurant Emem",
    url: "https://www.montysuites.com/calabar",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Ako by Terra",
    url: "https://ako.terrakulture.com/main-home/",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Brazzerie",
    url: "https://www.marriott.com/en-us/hotels/losfp-four-points-lagos/dining/",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Cilantro Restaurant",
    url: "https://www.marriott.com/en-us/hotels/losfp-four-points-lagos/dining/",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "DaVinci Restaurant",
    url: "https://www.thegeorgelagos.com/en/dining.html",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Ekaabo Restaurant",
    url: "https://www.thelagoscontinental.com/restaurant-lounges/ekaabo-terrace",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Hotpot Restaurant",
    url: "https://lagosoriental.com/Dining.html",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "La Giara Italian Restaurant",
    url: "https://www.marriott.com/en-us/hotels/lossi-sheraton-lagos-hotel/dining/",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Lounge Bar (Lilygate)",
    url: "https://www.lilygatelagos.com/dining",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Oriental Garden Chinese Restaurant",
    url: "https://lagosoriental.com/Dining.html",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Pumpkin Leaf",
    url: "https://www.marriott.com/en-us/hotels/lossi-sheraton-lagos-hotel/dining/",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Skyview Restaurant",
    url: "https://lagosoriental.com/Dining.html",
    source: "restaurant-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Soho Restaurant",
    url: "https://www.thelagoscontinental.com/restaurant-lounges/soho-restaurant",
    source: "restaurant-curated",
  },
];

function parsePlacesTs(src) {
  const rows = [];
  for (const m of src.matchAll(
    /\{ country: "([^"]+)", city: "([^"]+)", category: "([^"]+)", name: "([^"]+)", url: "([^"]+)" \}/g,
  )) {
    rows.push({
      country: m[1],
      city: m[2],
      category: m[3],
      name: m[4],
      url: m[5],
    });
  }
  return rows;
}

function placeKey(p) {
  return `${p.name}|${p.city}|${p.country}`.toLowerCase();
}

function sortPlaces(a, b) {
  const c = a.country.localeCompare(b.country);
  if (c !== 0) return c;
  const city = a.city.localeCompare(b.city);
  if (city !== 0) return city;
  const cat = a.category.localeCompare(b.category);
  if (cat !== 0) return cat;
  return a.name.localeCompare(b.name);
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const placesSrc = fs.readFileSync("app/places.ts", "utf8");
const existing = parsePlacesTs(placesSrc);
const keys = new Set(existing.map(placeKey));

const toAdd = [];
for (const row of pinBacklog) {
  if (HELD.has(row.name)) continue;
  const p = {
    country: row.country,
    city: row.city,
    category: row.category,
    name: row.name,
    url: row.url,
  };
  if (keys.has(placeKey(p))) continue;
  keys.add(placeKey(p));
  toAdd.push(p);
}

const merged = [...existing, ...toAdd].sort(sortPlaces);

const body = merged
  .map(
    (p) =>
      `  { country: "${esc(p.country)}", city: "${esc(p.city)}", category: "${esc(p.category)}", name: "${esc(p.name)}", url: "${esc(p.url)}" },`,
  )
  .join("\n");

const out = `export type Place = {
  country: string;
  city: string;
  category: string;
  name: string;
  url: string;
};

export const places: Place[] = [
${body}
];
`;

fs.writeFileSync("app/places.ts", out);

const counts = {};
for (const p of merged) {
  counts[p.category] = (counts[p.category] ?? 0) + 1;
}

const run = {
  checkedAt: new Date().toISOString(),
  branch: "cursor/restaurants",
  added: toAdd,
  held: [...HELD],
  countsAfter: counts,
};
fs.writeFileSync("data/places-ingest/restaurants-last-run.json", JSON.stringify(run, null, 2) + "\n");

console.log(`places.ts: ${existing.length} → ${merged.length} (+${toAdd.length})`);
console.log(`Restaurants: ${counts.Restaurants ?? 0}`);