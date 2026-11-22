import Link from "next/link";
import { homeCard } from "./home-section";

const tripTools = [
  ["Visa and entry", "/visa"],
  ["Find flights", "/flights"],
  ["Explore the map", "/map"],
] as const;

const hubs = [
  {
    href: "/detty-december",
    kicker: "Season focus",
    title: "Detty December hub",
    blurb: "Lagos season guide, confirmed nights, and how to plan around the festivities.",
  },
  {
    href: "/west-africa",
    kicker: "Year-round",
    title: "West Africa year-round",
    blurb: "Explore city guides and find things to do beyond December.",
  },
] as const;

/** Guide links for the merged Plan your trip section (no section wrapper of its own). */
export function QuickHubs() {
  return (
    <div id="hubs" className="min-w-0 scroll-mt-36">
      <h3 className="font-display text-2xl leading-none tracking-tight">Travel guides</h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {hubs.map((hub) => (
          <li key={hub.href}>
            <Link
              href={hub.href}
              className={`motion-lift flex h-full flex-col ${homeCard} px-5 py-6 hover:border-oxide/40`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-lagoon">{hub.kicker}</p>
              <p className="mt-3 font-display text-3xl leading-none tracking-tight">{hub.title}</p>
              <p className="mt-4 flex-1 text-sm leading-7 text-muted">{hub.blurb}</p>
              <span className="mt-5 text-[11px] uppercase tracking-[0.18em] text-oxide">Read guide</span>
            </Link>
          </li>
        ))}
      </ul>
      <nav aria-label="Travel tools" className="mt-4 flex flex-wrap gap-2">
        {tripTools.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="inline-flex min-h-11 items-center border border-ink/15 bg-chart px-4 text-sm font-medium hover:text-oxide"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
