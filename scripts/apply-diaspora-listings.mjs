/**
 * Curated diaspora-facing recreation and stay rows (organiser / official URLs verified HTTP < 400).
 * Run after apply-stay-listings.mjs: node scripts/apply-diaspora-listings.mjs
 */
import fs from "node:fs";

/** Rows held back — do not merge until a clear organiser homepage replaces shorteners or duplicates. */
const HELD = new Set([
  "Federal Palace & Casino",
]);

const pinBacklog = [
  {
    country: "Ghana",
    city: "Accra",
    category: "Hotels",
    name: "La Palm Royal Beach Hotel",
    url: "https://lapalmroyalbeachhotel.com/",
    source: "diaspora-curated",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Practical stops",
    name: "National Theatre of Ghana",
    url: "https://visitghana.com/attractions/national-theatre/",
    source: "diaspora-curated",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Practical stops",
    name: "Kwame Nkrumah Memorial Park",
    url: "https://visitghana.com/attractions/kwame-nkrumah-memorial-park/",
    source: "diaspora-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Practical stops",
    name: "Lekki Conservation Centre",
    url: "https://www.ncfnigeria.org/our-parks/lekki-conservation-centre/",
    source: "diaspora-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Practical stops",
    name: "National Theatre of Nigeria",
    url: "https://nationaltheatre.gov.ng/",
    source: "diaspora-curated",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Hotels",
    name: "La Campagne Tropicana Beach Resort",
    url: "https://www.lacampagnetropicana.com/",
    source: "diaspora-curated",
  },
  {
    country: "Nigeria",
    city: "Calabar",
    category: "Practical stops",
    name: "Tinapa Business and Leisure Resort",
    url: "https://www.tinapa.ng/",
    source: "diaspora-curated",
  },
  {
    country: "Nigeria",
    city: "Calabar",
    category: "Hotels",
    name: "Obudu Mountain Resort",
    url: "https://obudumountainresort.com/",
    source: "diaspora-curated",
  },
  {
    country: "Nigeria",
    city: "Calabar",
    category: "Practical stops",
    name: "Cross River State Tourism",
    url: "https://crossriverstate.gov.ng/tourism",
    source: "diaspora-curated",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Practical stops",
    name: "W.E.B. Du Bois Centre",
    url: "https://visitghana.com/w-e-b-dubois-centre/",
    source: "verified-ingest-2026-11-16",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Practical stops",
    name: "Independence Square",
    url: "https://visitghana.com/independence-square/",
    source: "verified-ingest-2026-11-16",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Practical stops",
    name: "Legon Botanical Gardens",
    url: "https://visitghana.com/legon-botanical-gardens/",
    source: "verified-ingest-2026-11-16",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Practical stops",
    name: "Osu Castle",
    url: "https://visitghana.com/osu-castle/",
    source: "verified-ingest-2026-11-16",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Practical stops",
    name: "Freedom Park Lagos",
    url: "https://freedomparklagos.com/",
    source: "verified-ingest-2026-11-16",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Practical stops",
    name: "Nike Art Gallery (Lagos)",
    url: "https://nikeartfoundation.com/",
    source: "verified-ingest-2026-11-16",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Practical stops",
    name: "National Museum Lagos",
    url: "https://museum.ng/museums/national-museums/",
    source: "verified-ingest-2026-11-16",
  },
  {
    country: "Nigeria",
    city: "Calabar",
    category: "Practical stops",
    name: "Drill Ranch (Calabar)",
    url: "https://www.pandrillus.org/drill-ranch/",
    source: "verified-ingest-2026-11-16",
  },
  {
    country: "Ghana",
    city: "Accra",
    category: "Practical stops",
    name: "Labadi Beach",
    url: "https://visitghana.com/attractions/labadi-beach/",
    source: "clear-nav-2026-11-16",
  },
  {
    country: "Ghana",
    city: "Cape Coast",
    category: "Practical stops",
    name: "Kakum National Park",
    url: "https://visitghana.com/attractions/kakum-national-park/",
    source: "clear-nav-2026-11-16",
  },
  {
    country: "Ghana",
    city: "Cape Coast",
    category: "Practical stops",
    name: "Elmina Castle",
    url: "https://visitghana.com/attractions/elmina-castle/",
    source: "clear-nav-2026-11-16",
  },
  {
    country: "Nigeria",
    city: "Lagos",
    category: "Practical stops",
    name: "Lagos State Ministry of Tourism, Arts and Culture",
    url: "https://lagosstate.gov.ng/ministry-of-tourism-arts-and-culture",
    source: "clear-nav-2026-11-16",
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
console.log(`places.ts diaspora: ${existing.length} → ${merged.length} (+${toAdd.length})`);
if (toAdd.length) {
  for (const p of toAdd) {
    console.log(`  + ${p.category}\t${p.city}\t${p.name}`);
  }
}

fs.mkdirSync("data/places-ingest", { recursive: true });
fs.writeFileSync(
  "data/places-ingest/diaspora-last-run.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      added: toAdd,
      held: [...HELD],
    },
    null,
    2,
  ),
);