import Link from "next/link";
import { events } from "../events";
import { visitorCategoryEntries, type VisitorCategoryEntry } from "../visitor-categories";
import { HomeCategoryStrip } from "./home-category-strip";

const pillarLink =
  "flex h-full flex-col border border-ink/15 bg-chart px-4 py-5 hover:border-oxide/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxide";

const pillars = [
  {
    href: "/events",
    kicker: "Confirmed",
    title: "Events",
    blurb: "Dated festivals and nights on file — tickets leave this site.",
  },
  {
    href: "/places",
    kicker: "Directory",
    title: "Places",
    blurb: "Hotels, restaurants, clubs, and organiser pages already sourced.",
  },
  {
    href: "/guides",
    kicker: "Season",
    title: "Guides",
    blurb: "Lagos, Accra, Calabar, and Carnival guides with outbound links.",
  },
  {
    href: "/visa",
    kicker: "Official",
    title: "Visa",
    blurb: "Government visa notes checked against public pages — not legal advice.",
  },
] as const;

const homePlaceCategories = new Set(["Hotels", "Restaurants", "Clubs", "Short-stay"]);

function placeCategoryPicks(): VisitorCategoryEntry[] {
  return visitorCategoryEntries().filter((row) => homePlaceCategories.has(row.category));
}

export function HomeStartNav() {
  const eventTotal = events.length;
  const categories = placeCategoryPicks();

  return (
    <section
      id="start-here"
      aria-labelledby="home-start-heading"
      className="scroll-mt-36 border-b border-ink/10 bg-paper-deep/40"
    >
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <h2 id="home-start-heading" className="sr-only">
          Where to go on dirtydecember.info
        </h2>
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Start here</p>
        <p className="mt-2 max-w-2xl font-display text-2xl leading-tight tracking-tight text-ink md:text-3xl">
          Events, places, guides, and visa — in under a minute
        </p>
        <nav aria-label="Main destinations" className="mt-6">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={pillarLink}>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-lagoon">{item.kicker}</p>
                  <p className="mt-2 font-display text-2xl leading-none tracking-tight">{item.title}</p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted">
                    {item.href === "/events" && eventTotal > 0
                      ? `${eventTotal} confirmed ${eventTotal === 1 ? "event" : "events"} on file. Tickets leave this site.`
                      : item.blurb}
                  </p>
                  <span className="mt-4 text-[11px] uppercase tracking-[0.16em] text-oxide">Open →</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">Places by type</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Hotels, restaurants, clubs, and short-stay hubs — counts from sourced rows only.
              </p>
            </div>
            <Link
              href="/places"
              className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide"
            >
              All places →
            </Link>
          </div>
          <HomeCategoryStrip entries={categories} />
        </div>
        <p className="mt-6 text-sm leading-6 text-muted">
          Interactive trip tools:{" "}
          <Link href="/guide" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Tourist guide
          </Link>
          {" · "}
          <Link href="/flights" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Flight searches
          </Link>
          {" · "}
          <Link href="/map" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Map
          </Link>
          .
        </p>
      </div>
    </section>
  );
}