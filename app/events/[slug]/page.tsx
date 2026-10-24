import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { disclaimer } from "../../brand";
import { JsonLd } from "../../components/json-ld";
import { DateBlock, PrimaryAction } from "../../components/event-card";
import { SaveTripButton } from "../../components/save-trip-button";
import { checkedOn, eventSlug, presentEvent } from "../../event-view";
import { events } from "../../events";
import { eventTripId } from "../../trip";
import { eventJsonLd } from "../../jsonld";
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
  const event = events.find((item) => eventSlug(item) === slug);
  if (!event) return { title: "Event" };
  const view = presentEvent(event);
  return pageMetadata({
    title: view.name,
    description: event.summary,
    path: view.href,
  });
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = events.find((item) => eventSlug(item) === slug);
  if (!event) notFound();
  const view = presentEvent(event);
  const checked = checkedOn(event);

  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pt-28 pb-28 md:px-8 md:pt-36 lg:pb-20">
      <JsonLd data={eventJsonLd(event)} />
      <Link
        href="/events"
        className="text-[11px] uppercase tracking-[0.2em] text-muted hover:text-oxide"
      >
        Events
      </Link>
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
          {view.venue ? <p className="mt-1 text-sm text-muted">{view.venue}</p> : null}
          {checked ? (
            <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted">{checked}</p>
          ) : null}
        </div>
      </div>
      <p className="mt-8 text-base leading-8 text-ink">{event.summary}</p>
      <div className="mt-8 flex flex-col items-start gap-4">
        <PrimaryAction event={event} />
        <SaveTripButton kind="event" id={eventTripId(event)} />
      </div>
      <p className="mt-8 max-w-xl text-sm leading-7 text-muted">{disclaimer}</p>
    </main>
  );
}
