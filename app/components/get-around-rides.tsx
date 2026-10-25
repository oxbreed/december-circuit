import { rideHailLinks, rideHailNote } from "../ride-hailing";
import { SectionIntro, sectionClassCompact } from "./section-intro";

const outbound =
  "text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide";

function RideList() {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {rideHailLinks.map((link) => (
        <li key={link.url} className="border-t border-ink/10 pt-3">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={outbound}
          >
            {link.name}
            <span className="text-muted"> — {link.region}</span>
          </a>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">
            Leaves this site
          </p>
        </li>
      ))}
    </ul>
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
      <RideList />
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
      <RideList />
    </section>
  );
}
