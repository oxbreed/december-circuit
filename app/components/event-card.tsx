import type { CircuitEvent } from "../events";
import { dateFace, presentEvent } from "../event-view";

export function DateBlock({ when }: { when: string }) {
  const face = dateFace(when);

  if (face.kind === "span") {
    return (
      <div
        className="flex shrink-0 self-start border border-ink/15 bg-paper"
        aria-label={when}
      >
        <div className="flex min-w-[4.5rem] flex-col items-center justify-center px-3 py-3 text-center">
          <span className="text-[10px] uppercase tracking-[0.16em] text-oxide">
            {face.fromMonth}
          </span>
          <span className="mt-1 font-display text-3xl leading-none">
            {face.fromDay}
          </span>
          <span className="mt-1 text-[10px] text-muted">{face.fromYear}</span>
        </div>
        <div className="w-px bg-ink/15" aria-hidden="true" />
        <div className="flex min-w-[4.5rem] flex-col items-center justify-center px-3 py-3 text-center">
          <span className="text-[10px] uppercase tracking-[0.16em] text-oxide">
            {face.toMonth}
          </span>
          <span className="mt-1 font-display text-3xl leading-none">
            {face.toDay}
          </span>
          <span className="mt-1 text-[10px] text-muted">{face.toYear}</span>
        </div>
      </div>
    );
  }

  if (face.kind === "text") {
    return (
      <div className="flex min-w-[4.75rem] shrink-0 self-start items-center border border-ink/15 bg-paper px-3 py-3 text-center">
        <p className="font-display text-xl leading-none">{face.text}</p>
      </div>
    );
  }

  return (
    <div
      className="flex min-w-[4.75rem] shrink-0 self-start flex-col items-center justify-center border border-ink/15 bg-paper px-2 py-3 text-center"
      aria-label={when}
    >
      <span className="text-[10px] uppercase tracking-[0.16em] text-oxide">
        {face.month}
      </span>
      <span className="mt-1 font-display text-[1.7rem] leading-none tracking-tight">
        {face.day}
      </span>
    </div>
  );
}

export function PrimaryAction({ event }: { event: CircuitEvent }) {
  if (event.ticketsUrl) {
    return (
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <a
          href={event.ticketsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex bg-oxide px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-chart"
        >
          Tickets
        </a>
        <span className="text-xs uppercase tracking-[0.16em] text-muted">
          Leaves this site
        </span>
        {event.url ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
          >
            {event.urlLabel ?? "Organiser page"} — leaves this site
          </a>
        ) : null}
      </div>
    );
  }

  if (event.url) {
    return (
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex bg-oxide px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-chart"
      >
        {event.urlLabel ?? "Organiser page"} — leaves this site
      </a>
    );
  }

  return (
    <p className="text-sm leading-7 text-muted">
      No ticket or organiser link on file.
    </p>
  );
}

export function EventCard({ event }: { event: CircuitEvent }) {
  const view = presentEvent(event);

  return (
    <article className="border border-ink/15 bg-chart shadow-[4px_4px_0_0_rgba(184,67,47,0.12)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
        <DateBlock when={event.when} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
            {view.category}
          </p>
          <h2 className="mt-2 font-display text-3xl leading-none tracking-tight sm:text-4xl">
            <a href={view.href} className="hover:text-oxide">
              {view.name}
            </a>
          </h2>
          <p className="mt-3 text-sm text-ink">{view.region}</p>
          <p className="mt-1 text-sm text-muted">
            {view.venue ?? "Venue not on file"}
          </p>
          {view.note ? (
            <p className="mt-3 text-sm leading-7 text-muted">{view.note}</p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-ink/10 px-4 py-4 sm:px-5">
        <PrimaryAction event={event} />
      </div>
    </article>
  );
}
