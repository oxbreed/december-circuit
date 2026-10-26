import Link from "next/link";
import { disclaimer } from "../../brand";
import { JsonLd } from "../../components/json-ld";
import {
  OutboundLink,
  SeasonGuideShell,
} from "../../components/season-guide-chrome";
import { breadcrumbJsonLd } from "../../jsonld";
import { flytimeTracker } from "../../season-guides";
import { pageMetadata } from "../../site";

const tracker = flytimeTracker();

export const metadata = pageMetadata({
  title: tracker.title,
  description: tracker.statusPlain,
  path: tracker.path,
  type: "article",
});

export default function FlytimeFest2026Page() {
  const incomplete = tracker.lineupStatus === "incomplete";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
          { name: "Flytime Fest 2026", path: tracker.path },
        ])}
      />
      <SeasonGuideShell
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Events", href: "/events" },
          { name: "Flytime Fest 2026" },
        ]}
        kicker="Lagos · lineup tracker"
        title={
          <>
            Flytime Fest <span className="italic text-oxide">2026</span>
          </>
        }
        lede={
          <>
            Sourced artist tracker for House of R&amp;B, Fest, and Circle already on the
            directory. {disclaimer}
          </>
        }
        currentPath={tracker.path}
      >
        <section className="mt-10 border border-ink/15 bg-chart px-5 py-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-oxide">
            Lineup status
          </p>
          <p className="mt-2 font-display text-2xl leading-tight tracking-tight">
            {incomplete ? "Incomplete — headliners still unannounced for Fest and Circle" : "Updated"}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink">{tracker.statusPlain}</p>
          <p className="mt-4">
            <OutboundLink href={tracker.organiserUrl}>
              {tracker.organiserLabel} — {tracker.organiserUrl.replace(/^https?:\/\//, "")} —
              leaves this site
            </OutboundLink>
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-3xl tracking-tight">Nights on file</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Artists appear only when a confirmed source is on file. Incomplete nights say so
            plainly.
          </p>
          <div className="mt-8 grid gap-8">
            {tracker.nights.map((night) => (
              <article
                key={night.id}
                id={night.id}
                className="scroll-mt-36 border-t border-ink/15 pt-8"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-lagoon">
                  {night.when} · {night.venue}
                </p>
                <h3 className="mt-2 font-display text-3xl leading-tight tracking-tight">
                  {night.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink">{night.summaryOnFile}</p>
                {night.lineupIncomplete || night.artists.length === 0 ? (
                  <p className="mt-4 border-l-2 border-oxide/50 pl-4 text-sm leading-7 text-ink">
                    Lineup incomplete. No confirmed headliners are linked for this night.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {night.artists.map((artist) => (
                      <li key={artist.name} className="border-t border-ink/10 pt-3">
                        <p className="font-display text-2xl leading-tight tracking-tight">
                          {artist.name}
                        </p>
                        <p className="mt-1">
                          <OutboundLink href={artist.sourceUrl}>
                            {artist.sourceLabel} — leaves this site
                          </OutboundLink>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-7 text-muted">
                  {night.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted">
                  Directory sourceId · {night.directorySourceId}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Changelog</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Dated editorial updates. Designed so a new announcement can be logged within hours —
            edit{" "}
            <code className="text-ink">data/season-guides/flytime-fest-2026.json</code>, prepend
            a changelog row, deploy.
          </p>
          <ol className="mt-6 space-y-6">
            {tracker.changelog.map((entry) => (
              <li key={`${entry.at}-${entry.summary.slice(0, 40)}`} className="border-t border-ink/10 pt-4">
                <time className="text-[11px] uppercase tracking-[0.18em] text-oxide">
                  {entry.at}
                </time>
                <p className="mt-2 text-sm leading-7 text-ink">{entry.summary}</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {entry.sources.map((source) => (
                    <li key={source} className="break-all">
                      {source.startsWith("http") ? (
                        <OutboundLink href={source}>{source}</OutboundLink>
                      ) : (
                        source
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-12 text-sm leading-7 text-muted">
          <Link
            href="/events?city=Lagos"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            All Lagos events on file
          </Link>
          {" · "}
          <Link
            href="/guides/lagos-december-2026"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            Lagos December 2026 guide
          </Link>
        </p>
      </SeasonGuideShell>
    </>
  );
}
