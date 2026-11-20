import Link from "next/link";
import { currentSponsors } from "../sponsors";
import { SponsorLink } from "./tracked-link";

function filedSponsor() {
  const sponsor = currentSponsors()[0];
  if (!sponsor) return null;
  const url = sponsor.url && /^https?:\/\//i.test(sponsor.url) ? sponsor.url : undefined;
  return { ...sponsor, name: sponsor.name.trim(), url };
}

export function SponsorSpot() {
  const sponsor = filedSponsor();
  if (!sponsor) return null;

  return (
    <aside aria-label="Paid placement" className="border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="border border-ink/15 bg-chart px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">Featured · Paid placement</p>
          {sponsor.url ? (
            <SponsorLink
              href={sponsor.url}
              slug={sponsor.slug}
              className="mt-3 inline-flex text-sm leading-6 text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              {sponsor.name}
            </SponsorLink>
          ) : (
            <p className="mt-3 text-sm leading-6 text-ink">{sponsor.name}</p>
          )}
          {sponsor.blurb ? <p className="mt-1 text-sm leading-6 text-muted">{sponsor.blurb}</p> : null}
          <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-muted">
            <Link href="/disclosure" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              About paid placements
            </Link>
            {" · "}
            <Link href="/get-featured" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              Get featured
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}

/** Small "Featured · Paid placement" badge for an event that has a current sponsor entry. */
export function FeaturedBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex border border-oxide/40 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-oxide ${className}`}>
      Featured · Paid placement
    </span>
  );
}
