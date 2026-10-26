import Link from "next/link";
import { disclaimer } from "../../brand";
import { JsonLd } from "../../components/json-ld";
import {
  OutboundLink,
  SeasonGuideShell,
} from "../../components/season-guide-chrome";
import { eventNameAndVenue, presentEvent } from "../../event-view";
import { breadcrumbJsonLd } from "../../jsonld";
import {
  carnivalPeakRollup,
  carnivalPublishedCheckedAt,
  carnivalScheduleNights,
} from "../../season-guides";
import { pageMetadata } from "../../site";

const path = "/guides/carnival-calabar-2026";

export const metadata = pageMetadata({
  title: "Carnival Calabar 2026 programme guide",
  description:
    "Official Carnival Calabar 2026 programme for diaspora travellers — theme, peak nights 26–30 December, and the full schedule from Cross River Carnival materials already on file. No invented nights.",
  path,
  type: "article",
});

export default function CarnivalCalabar2026Page() {
  const peak = carnivalPeakRollup();
  const nights = carnivalScheduleNights();
  const checkedAt = carnivalPublishedCheckedAt();
  const officialUrl =
    peak?.url ?? "https://www.carnival.crossriverstate.gov.ng/";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Carnival Calabar 2026", path },
        ])}
      />
      <SeasonGuideShell
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: "Carnival Calabar 2026" },
        ]}
        kicker="Calabar · official programme"
        title={
          <>
            Carnival Calabar <span className="italic text-oxide">2026</span>
          </>
        }
        lede={
          <>
            Programme explanation for diaspora visitors from the official Carnival Calabar
            materials already published on this directory. No night is invented. {disclaimer}
          </>
        }
        currentPath={path}
      >
        <section className="mt-10">
          <h2 className="font-display text-3xl tracking-tight">Official source</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Rows below come from sourceId <code className="text-ink">carnival-calabar</code>{" "}
            (Tier-1 official schedule).{" "}
            {checkedAt ? (
              <>
                Ingest snapshot checkedAt <time dateTime={checkedAt}>{checkedAt}</time>.
              </>
            ) : null}
          </p>
          <p className="mt-4">
            <OutboundLink href={officialUrl}>
              Official Carnival Calabar page — leaves this site
            </OutboundLink>
          </p>
          <p className="mt-2">
            <OutboundLink href="https://www.carnival.crossriverstate.gov.ng/schedule">
              Official schedule — leaves this site
            </OutboundLink>
          </p>
        </section>

        {peak ? (
          <section className="mt-14">
            <h2 className="font-display text-3xl tracking-tight">Peak carnival nights</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              The directory rollup for {peak.when} repeats the official peak programme already on
              file:
            </p>
            <article className="mt-6 border border-ink/15 bg-chart px-5 py-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-lagoon">
                {peak.when} · Calabar
              </p>
              <h3 className="mt-2 font-display text-3xl leading-tight tracking-tight">
                {eventNameAndVenue(peak.summary).name}
              </h3>
              <p className="mt-4 text-base leading-7 text-ink">{peak.summary}</p>
              {peak.url ? (
                <p className="mt-4">
                  <OutboundLink href={peak.url}>
                    {peak.urlLabel ?? "Official page"} — leaves this site
                  </OutboundLink>
                </p>
              ) : null}
            </article>
            <div className="mt-8 max-w-2xl space-y-4 text-sm leading-7 text-ink">
              <p>
                For diaspora travellers, those peak dates are the core carnival window already
                stated on the official rollup: Cultural Carnival and Night of Kings &amp; Queens
                (26th), Junior Carnival (27th), Parade of the Bands (28th), Bikers Carnival (29th),
                and Nyoro Ekpe (30th), under the theme named in that same summary.
              </p>
              <p className="text-muted">
                Clock times, ticket prices, and street route maps are not invented here — open the
                official pages for anything this directory does not store.
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-14">
            <p className="text-sm leading-7 text-muted">
              No Carnival Calabar peak rollup is on file yet.
            </p>
          </section>
        )}

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Full official schedule on file</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Individual nights published from the official schedule JS (same sourceId). Same-day
            entries stay separate. Nothing is added beyond that snapshot.
          </p>
          {nights.length === 0 ? (
            <p className="mt-6 text-sm leading-7 text-muted">
              No individual schedule nights are published yet.
            </p>
          ) : (
            <ol className="mt-8 space-y-0">
              {nights.map((event) => {
                const view = presentEvent(event);
                return (
                  <li
                    key={`${event.when}-${event.summary}`}
                    className="border-t border-ink/10 py-4"
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-lagoon">
                      {event.when}
                    </p>
                    <p className="mt-1 font-display text-2xl leading-tight tracking-tight">
                      {view.name}
                    </p>
                    {event.url ? (
                      <p className="mt-2">
                        <OutboundLink href={event.url}>
                          {event.urlLabel ?? "Official page"} — leaves this site
                        </OutboundLink>
                      </p>
                    ) : null}
                    <p className="mt-2">
                      <Link
                        href={view.href}
                        className="text-sm underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                      >
                        Directory event page
                      </Link>
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <p className="mt-12 text-sm leading-7 text-muted">
          <Link
            href="/cities/calabar"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            Calabar city page
          </Link>
          {" · "}
          <Link
            href="/events?city=Calabar"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            Calabar events filter
          </Link>
          {" · "}
          <Link
            href="/visa"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            Visa and entry
          </Link>
        </p>
      </SeasonGuideShell>
    </>
  );
}
