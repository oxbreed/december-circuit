import Link from "next/link";
import { rideHailMarkets, rideHailNote } from "../ride-hailing";
import { SectionIntro, sectionClassCompact } from "./section-intro";

const outbound =
  "text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide";

function citiesLine(cities: string[]) {
  if (cities.length <= 6) return cities.join(", ");
  return `${cities.slice(0, 5).join(", ")}, and other cities on file`;
}

function MarketGroups() {
  return (
    <div className="mt-6 grid gap-8">
      {rideHailMarkets.map((market) => (
        <section key={market.country} className="min-w-0">
          <h3 className="font-display text-2xl leading-tight tracking-tight">
            {market.country}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            On this directory: {citiesLine(market.citiesOnFile)}.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {market.apps.map((app) => (
              <li key={app.url} className="border-t border-ink/10 pt-2">
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={outbound}
                >
                  {app.name}
                  <span className="text-muted"> — {app.label}</span>
                </a>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
                  Leaves this site
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Compact block for guide / explore — no full section chrome. */
export function GetAroundRidesInline() {
  return (
    <div className="mt-8">
      <h3 className="text-[11px] uppercase tracking-[0.22em] text-lagoon">
        Ride apps
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{rideHailNote}</p>
      <MarketGroups />
    </div>
  );
}

/** Adjacent section for the flights page. */
export function GetAroundRidesSection() {
  return (
    <section id="get-around" className={`${sectionClassCompact} border-t border-ink/10`}>
      <SectionIntro
        kicker="Get around"
        title="Ride apps"
        lede={`${rideHailNote} Availability depends on each app and city.`}
      />
      <MarketGroups />
      <p className="mt-8 text-sm leading-7 text-muted">
        Car rental and map pins stay in the{" "}
        <Link href="/guide#around" className={outbound}>
          tourist guide
        </Link>
        .
      </p>
    </section>
  );
}
