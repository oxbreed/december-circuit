import Link from "next/link";
import { airbnbCitySearches, airbnbSearchNote } from "../outbound-airbnb";
import { events } from "../events";
import { rideHailMarkets } from "../ride-hailing";
import { visitorCategoryCountLine, visitorCategoryEntries } from "../visitor-categories";
import { VisitorCategoryHubGrid } from "./visitor-category-hub-grid";

const outbound = "text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide";
const hubApps = ["Bolt", "inDrive"] as const;

function rideAppLinks() {
  const seen = new Set<string>();
  const links: { name: string; url: string }[] = [];
  for (const market of rideHailMarkets) {
    for (const app of market.apps) {
      if (!hubApps.includes(app.name as (typeof hubApps)[number])) continue;
      if (seen.has(app.url)) continue;
      seen.add(app.url);
      links.push({ name: app.name, url: app.url });
    }
  }
  return links;
}

export function VisitorCategoryHub() {
  const entries = visitorCategoryEntries();
  return (
    <section aria-label="Browse by category" className="mt-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">Hotels, food, venues &amp; transport</p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">Open a category hub for sourced organiser pages — not prices or availability.</p>
      <VisitorCategoryHubGrid entries={entries} />
    </section>
  );
}

export function FindAStayOutbound() {
  return (
    <aside aria-label="Find a stay on Airbnb" className="mt-8 border border-ink/15 bg-chart px-5 py-6 md:px-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">Outbound stay search · not a partner link</p>
      <h3 className="mt-2 font-display text-2xl leading-none tracking-tight md:text-3xl">Homes on Airbnb</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{airbnbSearchNote}</p>
      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-6">
        {airbnbCitySearches.map((item) => (
          <li key={item.url}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className={outbound}>{item.city}, {item.country}</a>
            <span className="ml-2 text-[11px] uppercase tracking-[0.12em] text-muted">Leaves this site</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">Sourced short-stay organiser pages on file: <Link href="/categories/short-stay" className={outbound}>Short-stay category</Link>.</p>
    </aside>
  );
}

export function CarHireVisitorBlock() {
  const car = visitorCategoryEntries().find((item) => item.category === "Car rental");
  const apps = rideAppLinks();
  return (
    <aside aria-label="Car rental and rides" className="mt-8 border border-ink/15 bg-paper px-5 py-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">Car hire &amp; rides</p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
        {car ? (<><Link href={`/categories/${car.slug}`} className={outbound}>Car rental</Link>{car.count > 0 ? <span> — {visitorCategoryCountLine(car.count, car.category, car.exploreKind)}. </span> : <span> category hub. </span>}</>) : null}
        No sourced car-hauling operators on file yet. For city rides, use verified apps (outbound only):
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {apps.map((app) => (<li key={app.url}><a href={app.url} target="_blank" rel="noopener noreferrer" className={outbound}>{app.name}</a></li>))}
      </ul>
      <p className="mt-4 text-sm text-muted">Full ride-app matrix: <Link href="/guide#around" className={outbound}>Guide · Get around</Link> · <Link href="/flights#get-around" className={outbound}>Flights · Ride apps</Link>.</p>
    </aside>
  );
}

export function EventsVisitorEntry() {
  const total = events.length;
  return (
    <div className="mt-6 border border-ink/15 bg-chart px-5 py-5">
      <p className="text-sm leading-7 text-muted">
        <Link href="/events" className="font-display text-xl underline decoration-ink/30 underline-offset-4 hover:text-oxide">Events directory</Link>
        {total > 0 ? <span> — {total} confirmed {total === 1 ? "event" : "events"} on file. Tickets leave this site when a record has a link.</span> : <span> — confirmed events only when already on file.</span>}
      </p>
    </div>
  );
}
