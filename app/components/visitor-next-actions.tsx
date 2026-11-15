import Link from "next/link";

const actions = [
  { href: "/events", kicker: "On file", title: "Events", blurb: "Confirmed nights, festivals, and season dates — tickets leave this site.", primary: true },
  { href: "/places", kicker: "Directory", title: "Places", blurb: "Hotels, restaurants, clubs, and organiser pages already sourced.", primary: false },
  { href: "/guide#stay", kicker: "Outbound", title: "Stay", blurb: "Sourced stay records plus Airbnb city search — no booking here.", primary: false },
  { href: "/guide#around", kicker: "Outbound", title: "Rides", blurb: "Ride apps and car rental on file — fares stay on their sites.", primary: false },
] as const;

export function VisitorNextActions({ className = "mt-8", heading }: { className?: string; heading?: string }) {
  return (
    <nav aria-label="Plan your trip" className={className}>
      {heading ? <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-lagoon">{heading}</p> : null}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <li key={action.href}>
            <Link href={action.href} className={`flex h-full flex-col border px-4 py-5 ${action.primary ? "border-oxide/40 bg-oxide text-chart" : "border-ink/15 bg-chart"}`}>
              <p className={`text-[10px] uppercase tracking-[0.16em] ${action.primary ? "text-chart/80" : "text-lagoon"}`}>{action.kicker}</p>
              <p className={`mt-2 font-display text-2xl leading-none tracking-tight ${action.primary ? "text-chart" : "text-ink"}`}>{action.title}</p>
              <p className={`mt-3 flex-1 text-sm leading-6 ${action.primary ? "text-chart/90" : "text-muted"}`}>{action.blurb}</p>
              <span className={`mt-4 text-[11px] uppercase tracking-[0.16em] ${action.primary ? "text-chart" : "text-oxide"}`}>Open →</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
