import Link from "next/link";

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

export function QuickHubs() {
  return (
    <section id="hubs" className="border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Travel guides</p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
          Plan your trip
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {hubs.map((hub) => (
            <li key={hub.href}>
              <Link
                href={hub.href}
                className="motion-lift flex h-full flex-col border border-ink/15 bg-chart px-5 py-6 hover:border-oxide/40"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                  {hub.kicker}
                </p>
                <p className="mt-3 font-display text-3xl leading-none tracking-tight">
                  {hub.title}
                </p>
                <p className="mt-4 flex-1 text-sm leading-7 text-muted">{hub.blurb}</p>
                <span className="mt-5 text-[11px] uppercase tracking-[0.18em] text-oxide">
                  Read guide
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <nav aria-label="Travel tools" className="mt-4 flex flex-wrap gap-2">
          {tripTools.map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center rounded-sm border border-ink/15 bg-chart px-4 text-sm font-medium hover:text-oxide">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
