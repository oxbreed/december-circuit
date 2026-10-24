import { sponsors } from "../sponsors";

function filedSponsor() {
  const sponsor = sponsors.find((item) => item.name.trim().length > 0);
  if (!sponsor) return null;
  const url = sponsor.url && /^https?:\/\//i.test(sponsor.url) ? sponsor.url : undefined;
  return { name: sponsor.name.trim(), url };
}

export function SponsorSpot() {
  const sponsor = filedSponsor();
  if (!sponsor) return null;

  return (
    <aside aria-label="Paid placement" className="border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="border border-ink/15 bg-chart px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">Paid placement</p>
          {sponsor.url ? (
            <a
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm leading-6 text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              {sponsor.name}
            </a>
          ) : (
            <p className="mt-3 text-sm leading-6 text-ink">{sponsor.name}</p>
          )}
        </div>
      </div>
    </aside>
  );
}
