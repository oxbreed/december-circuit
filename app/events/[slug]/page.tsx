import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { disclaimer } from "../../brand";
import { AddToCalendar } from "../../components/add-to-calendar";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { JsonLd } from "../../components/json-ld";
import { DateBlock, PrimaryAction } from "../../components/event-card";
import { SaveTripButton } from "../../components/save-trip-button";
import { calendarLinksFor } from "../../event-calendar";
import { eventDateSpan, fullEventDateLabel } from "../../event-dates";
import { checkedOn, eventBySlug, eventSlug, presentEvent } from "../../event-view";
import { events } from "../../events";
import { nearbyStaysFor } from "../../nearby-stays";
import { eventTripId } from "../../trip";
import { breadcrumbJsonLd, eventJsonLd } from "../../jsonld";
import { shareImageForEvent } from "../../share-images";
import { pageMetadata } from "../../site";

export function generateStaticParams() {
  return events.map((event) => ({ slug: eventSlug(event) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolved = eventBySlug(slug);
  if (!resolved) return { title: "Event" };
  const { event } = resolved;
  const view = presentEvent(event);
  const whenLabel = fullEventDateLabel(event.when);
  return pageMetadata({
    title: `${view.name} — ${view.region}`,
    description: `${event.summary} ${whenLabel}. Sourced listing on dirtydecember.info for Detty December / December ${view.region}. Tickets and organiser pages leave this site.`,
    path: view.href,
    image: shareImageForEvent(event),
  });
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = eventBySlug(slug);
  if (!resolved) notFound();
  if (!resolved.canonical) {
    permanentRedirect(`/events/${eventSlug(resolved.event)}`);
  }

  const event = resolved.event;
  const view = presentEvent(event);
  const checked = checkedOn(event);
  const whenLabel = fullEventDateLabel(event.when);
  const span = eventDateSpan(event.when);
  const calendar = calendarLinksFor(event);
  const stays = nearbyStaysFor(event);
  const sourceLabel = event.urlLabel ?? "Source";

  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pt-28 pb-28 md:px-8 md:pt-36 lg:pb-20">
      <JsonLd data={eventJsonLd(event)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
          { name: view.name, path: view.href },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Events", href: "/events" },
          { name: view.name },
        ]}
      />
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
        <DateBlock when={event.when} />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
            {view.category}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-[0.95] tracking-tight sm:text-6xl">
            {view.name}
          </h1>
          <p className="mt-4 text-sm text-ink">{view.region}</p>
          <p className="mt-2 text-base leading-7 text-ink">
            <time dateTime={span?.start}>{whenLabel}</time>
          </p>
          {view.venue ? (
            <p className="mt-2 text-sm text-muted">
              <span className="text-[10px] uppercase tracking-[0.16em] text-lagoon">Venue</span>
              <span className="mt-1 block text-ink">{view.venue}</span>
            </p>
          ) : null}
          {checked ? (
            <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted">{checked}</p>
          ) : null}
        </div>
      </div>
      <p className="mt-8 text-base leading-8 text-ink">{event.summary}</p>

      {event.url ? (
        <p className="mt-6 text-sm leading-7 text-muted">
          <span className="text-[10px] uppercase tracking-[0.16em] text-lagoon">Source</span>
          <span className="mt-1 block">
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              {sourceLabel} — leaves this site
            </a>
          </span>
        </p>
      ) : (
        <p className="mt-6 text-sm leading-7 text-muted">No source URL is listed for this row.</p>
      )}

      <div className="mt-8 flex flex-col items-start gap-4">
        <PrimaryAction event={event} />
        <SaveTripButton kind="event" id={eventTripId(event)} />
      </div>

      {calendar ? (
        <section className="mt-10 border-t border-ink/10 pt-8">
          <h2 className="font-display text-2xl tracking-tight">Add to calendar</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            Uses the sourced dates on file ({whenLabel}). No clock time is added.
          </p>
          <div className="mt-4">
            <AddToCalendar links={calendar} />
          </div>
        </section>
      ) : null}

      {stays.length > 0 ? (
        <section className="mt-10 border-t border-ink/10 pt-8">
          <h2 className="font-display text-2xl tracking-tight">Nearby stays</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            Hotels and short-stays already listed for {view.region} on this site —
            organiser pages only, no invented rates.
          </p>
          <ul className="mt-5 divide-y divide-ink/10 border border-ink/15 bg-chart">
            {stays.map(({ place }) => (
              <li
                key={place.slug}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:px-5"
              >
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                    {place.category}
                  </p>
                  <Link
                    href={`/place/${place.slug}`}
                    className="mt-1 block font-display text-xl leading-none hover:text-oxide"
                  >
                    {place.name}
                  </Link>
                </div>
                <a
                  href={place.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm text-muted underline decoration-ink/20 underline-offset-4 hover:text-oxide"
                >
                  Organiser page — leaves this site
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-8 text-sm leading-7 text-muted">
        <Link href="/events" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          All confirmed events
        </Link>
        {" · "}
        <Link href="/cities" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Cities
        </Link>
        {" · "}
        <Link href="/guide" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Tourist guide
        </Link>
      </p>
      <p className="mt-6 max-w-xl text-sm leading-7 text-muted">{disclaimer}</p>
    </main>
  );
}
