/**
 * One-off merge for stay listings: pins backlog + OSM website-verified POIs (Lagos/Accra/Calabar).
 * Run: node scripts/fetch-osm-place-candidates.mjs && node scripts/apply-stay-listings.mjs
 */
import fs from "node:fs";

const OSM_HELD = new Set([
  "Federal Palace & Casino", // duplicate organiser row (Federal Palace Hotel on file)
  "Cosa Nostra Patron", // link shortener, not an organiser homepage
]);

const pinBacklog = [
  {
    country: "Cameroon",
    city: "Douala",
    category: "Hotels",
    name: "K Hotel",
    url: "https://www.khoteldouala.com/",
    source: "sourced-map-pin",
  },
  {
    country: "Côte d’Ivoire",
    city: "Abidjan",
    category: "Practical stops",
    name: "Aéroport international Félix Houphouët-Boigny",
    url: "https://transports.gouv.ci/structures-sous-tutelle",
    source: "sourced-map-pin",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Hotels",
    name: "Labadi Beach Hotel",
    url: "https://labadibeachhotelgh.com/contact/",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Abuja",
    category: "Hotels",
    name: "Transcorp Hilton Abuja",
    url: "https://www.hilton.com/en/hotels/abuhitw-transcorp-hilton-abuja/",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Benin City",
    category: "Hotels",
    name: "Protea Hotel Benin City Select Emotan",
    url: "https://www.marriott.com/en-us/hotels/bnise-protea-hotel-benin-city-select-emotan/overview/",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Jos",
    category: "Practical stops",
    name: "Yakubu Gowon Airport",
    url: "https://faan.gov.ng/press-release/faan-md-ce-we-will-support-plateau-state-to-become-a-leader-in-agriculture/",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Hotels",
    name: "Four Points by Sheraton Lagos",
    url: "https://www.marriott.com/en-us/hotels/losfp-four-points-lagos/overview/",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Hotels",
    name: "Radisson Blu Anchorage Hotel, Lagos",
    url: "https://www.radissonhotels.com/en-us/hotels/radisson-blu-lagos-anchorage",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Hotels",
    name: "Sheraton Lagos Hotel",
    url: "https://www.marriott.com/en-us/hotels/lossi-sheraton-lagos-hotel/overview/",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Hotels",
    name: "The Wheatbaker",
    url: "https://thewheatbakerlagos.com/contact/",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Bars",
    name: "Surface Bar & Grill",
    url: "https://www.radissonhotels.com/en-us/hotels/radisson-blu-lagos-anchorage",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Bars",
    name: "The View",
    url: "https://www.radissonhotels.com/en-us/hotels/radisson-blu-lagos-anchorage",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Restaurants",
    name: "Voyage Restaurant",
    url: "https://www.radissonhotels.com/en-us/hotels/radisson-blu-lagos-anchorage",
    source: "sourced-map-pin",
  },
  {
    country: "Nigeria",
    city: "Uyo",
    category: "Practical stops",
    name: "Victor Attah International Airport",
    url: "https://akwaibomstate.gov.ng/gov-eno-secures-federal-approval-for-international-status-for-victor-attah-airport/",
    source: "sourced-map-pin",
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

let osm = [];
try {
  osm = JSON.parse(fs.readFileSync("/tmp/places-candidates.json", "utf8"));
} catch {
  console.warn("No /tmp/places-candidates.json — pin backlog only");
}

const toAdd = [];
for (const row of [...pinBacklog, ...osm]) {
  if (OSM_HELD.has(row.name)) continue;
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
console.log(`places.ts: ${existing.length} → ${merged.length} (+${toAdd.length})`);

const counts = {};
for (const p of merged) {
  counts[p.category] = (counts[p.category] ?? 0) + 1;
}
console.log(JSON.stringify(counts, null, 2));