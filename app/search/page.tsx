import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import { breadcrumbJsonLd } from "../jsonld";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Search",
  description: "Search confirmed events, organiser places, and season guide pages already on file at dirtydecember.info.",
  path: "/search",
});

export default function SearchPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-6xl px-5 pb-28 pt-28 md:px-8 md:pt-36 lg:pb-16">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Search", path: "/search" }])} />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Search" }]} />
      <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-lagoon">Directory search</p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">Search</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">Matches confirmed events, organiser places, and guide pages already on file.</p>
      <form role="search" action="/events" method="get" className="mt-8 max-w-xl">
        <label htmlFor="search-page-q" className="sr-only">Search query</label>
        <div className="flex gap-2">
          <input id="search-page-q" name="q" type="search" placeholder="Event, place, city, or guide" className="ledger-input flex-1" />
          <button type="submit" className="shrink-0 bg-oxide px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-chart">Search</button>
        </div>
      </form>
    </main>
  );
}
