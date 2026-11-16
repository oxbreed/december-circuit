import fs from "node:fs";

const UA =
  "DirtyDecember/1.0 (https://www.dirtydecember.info; hello@dirtydecember.info)";
const cities = {
  Lagos: { country: "Nigeria", south: 6.38, west: 3.3, north: 6.55, east: 3.5 },
  Accra: { country: "Ghana", south: 5.52, west: -0.28, north: 5.68, east: -0.1 },
  Calabar: {
    country: "Nigeria",
    south: 4.9,
    west: 8.28,
    north: 5.05,
    east: 8.4,
  },
};
const kinds = {
  hotels: ['["tourism"="hotel"]', '["tourism"="guest_house"]'],
  restaurants: ['["amenity"="restaurant"]', '["amenity"="cafe"]'],
  clubs: ['["amenity"="nightclub"]', '["amenity"="bar"]', '["amenity"="pub"]'],
};
const categoryMap = {
  hotels: "Hotels",
  restaurants: "Restaurants",
  clubs: "Clubs",
};

const placesSrc = fs.readFileSync("app/places.ts", "utf8");
const placeUrls = new Set(
  [...placesSrc.matchAll(/url: "([^"]+)"/g)].map((m) => m[1].replace(/\/$/, "")),
);
const placeNames = new Set(
  [...placesSrc.matchAll(/name: "([^"]+)"/g)].map((m) => m[1].toLowerCase()),
);

const ENDPOINTS = [
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

async function overpass(cityName, bounds, tagFilters) {
  const box = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
  const parts = tagFilters.map((f) => `nwr${f}(${box});`);
  const q = `[out:json][timeout:35];(${parts.join("")});out center tags 80;`;
  let lastErr = null;
  for (const endpoint of ENDPOINTS) {
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": UA,
        },
        body: `data=${encodeURIComponent(q)}`,
        signal: AbortSignal.timeout(55_000),
      });
      const text = await r.text();
      if (!r.ok) throw new Error(`${r.status} ${text.slice(0, 80)}`);
      const j = JSON.parse(text);
      return j.elements ?? [];
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error("Overpass failed", cityName, tagFilters, lastErr);
  return [];
}

async function okUrl(url) {
  try {
    const r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
      headers: { "User-Agent": UA },
    });
    return r.status < 400;
  } catch {
    return false;
  }
}

function urlOverlap(a, b) {
  const na = a.replace(/\/$/, "").toLowerCase();
  const nb = b.replace(/\/$/, "").toLowerCase();
  return na.startsWith(nb) || nb.startsWith(na);
}

const candidates = [];
for (const [cityName, bounds] of Object.entries(cities)) {
  for (const [kind, tags] of Object.entries(kinds)) {
    await new Promise((r) => setTimeout(r, 2200));
    const els = await overpass(cityName, bounds, tags);
    for (const el of els) {
      const t = el.tags ?? {};
      const name = t.name ?? t["name:en"];
      const website = (t.website ?? t["contact:website"] ?? "").trim();
      if (!name || !website || !/^https?:\/\//i.test(website)) continue;
      if (placeNames.has(name.toLowerCase())) continue;
      const norm = website.replace(/\/$/, "");
      if ([...placeUrls].some((u) => urlOverlap(u, norm))) continue;
      let cat = categoryMap[kind];
      if (
        kind === "clubs" &&
        /bar|pub|grill|lounge/i.test(name) &&
        !/club|night/i.test(name)
      ) {
        cat = "Bars";
      }
      candidates.push({
        country: bounds.country,
        city: cityName,
        category: cat,
        name,
        url: website,
        source: "openstreetmap-website-tag",
        osmId: el.id,
      });
    }
  }
}

console.log("Raw candidates", candidates.length);
const verified = [];
for (const c of candidates) {
  await new Promise((r) => setTimeout(r, 150));
  if (await okUrl(c.url)) verified.push(c);
}

const seenUrl = new Set();
const out = [];
for (const c of verified) {
  const u = c.url.replace(/\/$/, "").toLowerCase();
  if (seenUrl.has(u)) continue;
  seenUrl.add(u);
  out.push(c);
}

fs.writeFileSync("/tmp/places-candidates.json", JSON.stringify(out, null, 2));
console.log("Verified unique", out.length);
for (const c of out) {
  console.log(`${c.category}\t${c.city}\t${c.name}\t${c.url}`);
}