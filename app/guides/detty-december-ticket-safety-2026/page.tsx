import Link from "next/link";
import { disclaimer } from "../../brand";
import { JsonLd } from "../../components/json-ld";
import { SeasonGuideShell } from "../../components/season-guide-chrome";
import { eventDateSpan, fullEventDateLabel } from "../../event-dates";
import { presentEvent } from "../../event-view";
import { events } from "../../events";
import { breadcrumbJsonLd, webPageJsonLd } from "../../jsonld";
import { pageMetadata } from "../../site";
import { sortByStart } from "../../components/event-date-list";

const path = "/guides/detty-december-ticket-safety-2026";

export const metadata = pageMetadata({
  title: "Detty December 2026 ticket safety",
  description:
    "How to find the real ticket page for Detty December 2026 events, with the organiser or ticket link on file for each event and how we label sources.",
  path,
  type: "article",
});

const linkClass =
  "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function TicketSafetyPage() {
  const direct = sortByStart(
    events.filter(
      (event) =>
        event.ticketsUrl ||
        event.urlLabel === "Organiser's page" ||
        event.urlLabel === "Official page",
    ),
  ).filter(
    (event) =>
      event.sourceId !== "carnival-calabar" ||
      presentEvent(event).name === "Carnival Calabar",
  );
  const unconfirmed = sortByStart(
    events.filter(
      (event) =>
        !event.ticketsUrl &&
        (event.urlLabel === "News report" ||
          event.urlLabel === "Event roundup" ||
          event.urlLabel === "Event listing"),
    ),
  );
  const labelCounts = new Map<string, number>();
  for (const event of events) {
    const label = event.urlLabel ?? "Source";
    labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
  }
  const description = `${direct.length} events with an organiser, official or ticket link on file, and ${unconfirmed.length} that rest on a news report, roundup or listing.`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: "Ticket safety", path },
        ])}
      />
      <JsonLd
        data={webPageJsonLd({
          path,
          name: "Detty December 2026 ticket safety",
          description,
        })}
      />
      <SeasonGuideShell
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: "Ticket safety" },
        ]}
        kicker="Tickets · official links · sources"
        title={
          <>
            Detty December <span className="italic text-oxide">2026</span> ticket safety
          </>
        }
        lede={
          <>
            How to reach the real ticket page for a December event. {description} This site
            does not sell tickets or take payment. {disclaimer}
          </>
        }
        currentPath={path}
      >
        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-3xl tracking-tight">
            Five checks before you pay
          </h2>
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-base leading-7">
            <li>
              Start from the organiser or official page for the event, then follow its ticket
              button. The lists below give that page for each event.
            </li>
            <li>
              Read the web address before you pay. It should be the organiser’s own domain or
              the ticket platform the organiser links to.
            </li>
            <li>
              Be wary of anyone asking you to pay into a personal bank account, or selling a
              ticket as a screenshot.
            </li>
            <li>
              Keep the order confirmation and the email or app ticket the platform sends you.
            </li>
            <li>
              If an event has no organiser or ticket page on file, wait for the organiser to
              publish one. Do not buy from an unverified seller.
            </li>
          </ol>
        </section>

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">
            Organiser, official and ticket links on file
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            These links leave this site. Each is the page we sourced the event from, or the
            ticket link the organiser publishes.
          </p>
          <ul className="mt-6 divide-y divide-ink/10 border border-ink/15 bg-chart">
            {direct.map((event) => {
              const view = presentEvent(event);
              const link = event.ticketsUrl ?? event.url;
              return (
                <li
                  key={view.slug}
                  className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <Link href={view.href} className="font-display text-xl leading-tight hover:text-oxide">
                      {view.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted">
                      {view.region} ·{" "}
                      <time dateTime={eventDateSpan(event.when)?.start}>
                        {fullEventDateLabel(event.when)}
                      </time>
                    </p>
                  </div>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`shrink-0 break-all text-sm ${linkClass}`}
                    >
                      {event.ticketsUrl ? "Ticket link" : "Organiser page"}: {host(link)}
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {unconfirmed.length > 0 ? (
          <section className="mt-14 border-t border-ink/10 pt-10">
            <h2 className="font-display text-3xl tracking-tight">
              Events with no organiser ticket page on file
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              These events are listed from a news report, event roundup or listing. We have not
              confirmed a ticket page from the organiser, so check the organiser’s own channels
              before you buy.
            </p>
            <ul className="mt-6 space-y-2 text-sm leading-6">
              {unconfirmed.map((event) => {
                const view = presentEvent(event);
                return (
                  <li key={view.slug}>
                    <Link href={view.href} className={linkClass}>
                      {view.name}
                    </Link>
                    <span className="text-muted">
                      {" "}— {view.region}, {fullEventDateLabel(event.when)} · {event.urlLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="mt-14 border-t border-ink/10 pt-10 max-w-3xl">
          <h2 className="font-display text-3xl tracking-tight">How we label sources</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Every event carries one source label. Counts below are for the {events.length} events
            on file today.
          </p>
          <ul className="mt-4 space-y-1 text-sm leading-6">
            {[...labelCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([label, count]) => (
                <li key={label}>
                  <span className="text-ink">{label}</span>
                  <span className="text-muted"> — {count}</span>
                </li>
              ))}
          </ul>
          <p className="mt-6 text-sm leading-7 text-muted">
            For wider context, TheRadar’s guide to buying a Detty December ticket in Lagos (22
            November 2026) lists the official sale channels it could verify and says it could
            not confirm an official ticket link for Flytime’s December shows:{" "}
            <a
              href="https://theradar.ng/entertainment/buying-a-detty-december-ticket-in-lagos-how-to-tell-a-real-one-from-a-fake"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              theradar.ng
            </a>
            .
          </p>
        </section>

        <p className="mt-12 text-sm leading-7 text-muted">
          <Link href="/detty-december/calendar" className={linkClass}>Calendar</Link>
          {" · "}
          <Link href="/events" className={linkClass}>All events</Link>
          {" · "}
          <Link href="/faq" className={linkClass}>FAQ</Link>
          {" · "}
          <Link href="/disclosure" className={linkClass}>Disclosure</Link>
        </p>
      </SeasonGuideShell>
    </>
  );
}
