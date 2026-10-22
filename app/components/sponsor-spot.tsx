import Link from "next/link";
import { sponsors } from "../sponsors";

function filedSponsor() {
  const sponsor = sponsors.find((item) => item.name.trim().length > 0);
  if (!sponsor) return null;
  const url = sponsor.url && /^https?:\/\//i.test(sponsor.url) ? sponsor.url : undefined;
  return { name: sponsor.name.trim(), url };
}

export function SponsorSpot() {
  const sponsor = filedSponsor();

  return (
    <aside aria-label="Paid placement" className="border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="border border-dashed border-ink/30 bg-chart px-4 py-4">
          {sponsor ? (
            sponsor.url ? (
              <a
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm leading-6 text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {sponsor.name}
              </a>
            ) : (
              <p className="text-sm leading-6 text-ink">{sponsor.name}</p>
            )
          ) : (
            <>
              <p className="text-sm leading-6 text-muted">
                Paid placement. No sponsor is on file.
              </p>
              <Link
                href="/list"
                className="mt-3 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                List an event or place an ad
              </Link>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
