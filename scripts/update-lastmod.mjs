// Writes data/lastmod.json: real last-change dates for sitemap <lastmod>.
// Run before committing content changes:  node scripts/update-lastmod.mjs
// Dates come from git history for the files that feed each page family. A file
// with uncommitted edits counts as changed today.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const today = new Date().toISOString().slice(0, 10);

// Safe to run before every build: with no git history (not a repo, or a shallow
// clone such as Vercel's) the dates would be wrong, so keep the committed file.
function gitOut(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}
if (
  gitOut(["rev-parse", "--is-inside-work-tree"]) !== "true" ||
  gitOut(["rev-parse", "--is-shallow-repository"]) !== "false"
) {
  console.log("update-lastmod: no full git history here, keeping data/lastmod.json as committed.");
  process.exit(0);
}

function git(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function dateOf(path) {
  if (!existsSync(path)) return null;
  if (git(["status", "--porcelain", "--", path])) return today;
  return git(["log", "-1", "--format=%cs", "--", path]) || null;
}

function latest(paths) {
  const dates = paths.map(dateOf).filter(Boolean).sort();
  return dates.at(-1) ?? today;
}

const staticPaths = {};
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (["admin", "api", "preview", "auth"].includes(name)) continue;
      walk(full);
    } else if (name === "page.tsx") {
      const route = "/" + dir.replace(/^app\/?/, "");
      if (route.includes("[")) continue;
      staticPaths[route === "/" ? "/" : route.replace(/\/$/, "")] = dateOf(full);
    }
  }
}
walk("app");

// Hub pages list their children, so a hub changes whenever a page under it (or the
// shared data it renders) changes. Without this a regenerated build could push a hub's
// date back behind its newest child, e.g. /guides behind a freshly added guide.
const hubSharedFiles = {
  "/guides": ["app/season-guides.ts", "app/seo-article-drafts.ts", "app/components/season-guide-chrome.tsx"],
};
for (const route of Object.keys(staticPaths)) {
  if (route === "/") continue; // home has its own rule below
  const childDates = Object.entries(staticPaths)
    .filter(([r]) => r.startsWith(route + "/"))
    .map(([, d]) => d);
  const shared = (hubSharedFiles[route] ?? []).map(dateOf);
  const all = [staticPaths[route], ...childDates, ...shared].filter(Boolean).sort();
  if (all.length) staticPaths[route] = all.at(-1);
}

const eventsDate = latest([
  "app/events.ts",
  "data/event-ingest/published.json",
  "app/event-seo.ts",
  "app/events/[slug]/page.tsx",
]);
const placesDate = latest(["app/places.ts", "app/place/[slug]/page.tsx", "app/place-catalog.ts"]);
const homeDate = latest(["app/page.tsx", "app/home-featured.ts", "app/events.ts"]);

writeFileSync(
  "data/lastmod.json",
  JSON.stringify(
    {
      generated: today,
      events: eventsDate,
      places: placesDate,
      cities: [eventsDate, placesDate, dateOf("app/cities.ts")].filter(Boolean).sort().at(-1),
      home: homeDate,
      static: staticPaths,
    },
    null,
    2,
  ) + "\n",
);
console.log("wrote data/lastmod.json", { eventsDate, placesDate, homeDate });
