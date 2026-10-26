import Link from "next/link";

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
    blurb: "Cities and organiser pages beyond December — Accra, Calabar, and the wider circuit.",
  },
] as const;

export function QuickHubs() {
  return (
    <section id="hubs" className="border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Quick hubs</p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
          Where to go next
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {hubs.map((hub) => (
            <li key={hub.href}>
              <Link
                href={hub.href}
                className="flex h-full flex-col border border-ink/15 bg-chart px-5 py-6 hover:border-oxide/40"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                  {hub.kicker}
                </p>
                <p className="mt-3 font-display text-3xl leading-none tracking-tight">
                  {hub.title}
                </p>
                <p className="mt-4 flex-1 text-sm leading-7 text-muted">{hub.blurb}</p>
                <span className="mt-5 text-[11px] uppercase tracking-[0.18em] text-oxide">
                  Open hub →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
