import { connection } from "next/server";
import { Suspense } from "react";
import { datesOnFile } from "../jsonld";
import { events, type CircuitEvent } from "../events";
import { eventsInRegionOrder, presentEvent } from "../event-view";
import { rangesOverlap, weekWindows, type WeekWindow } from "../week";
import { LoadingLines } from "./states";

function spanFor(event: CircuitEvent) {
  const dates = datesOnFile(event.when);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dates.startDate)) return null;
  const end =
    dates.endDate && /^\d{4}-\d{2}-\d{2}$/.test(dates.endDate)
      ? dates.endDate
      : dates.startDate;
  return { start: dates.startDate, end };
}

function eventsIn(window: WeekWindow) {
  const matched = events.filter((event) => {
    const span = spanFor(event);
    if (!span) return false;
    return rangesOverlap(span.start, span.end, window.start, window.end);
  });
  return eventsInRegionOrder(matched);
}

function WeekList({ window }: { window: WeekWindow }) {
  const rows = eventsIn(window);
  return (
    <div>
      <h3 className="font-display text-2xl leading-tight tracking-tight">{window.title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm leading-7 text-muted">Nothing listed.</p>
      ) : (
        <ul className="mt-3">
          {rows.map((event) => {
            const view = presentEvent(event);
            return (
              <li key={`${event.region}-${event.when}`} className="border-t border-ink/10 py-3">
                <a href={view.href} className="font-display text-2xl leading-tight tracking-tight hover:text-oxide">
                  {view.name}
                </a>
                <p className="mt-1 text-sm text-ink">{event.region}</p>
                <p className="mt-1 text-sm text-muted">{event.when}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

async function WeekBody() {
  await connection();
  const { thisWeek, nextWeek } = weekWindows(new Date());
  const any = eventsIn(thisWeek).length + eventsIn(nextWeek).length > 0;

  if (!any) {
    return (
      <p className="mt-6 max-w-2xl text-sm leading-7 text-ink">
        Nothing listed falls in this week or next.
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2">
      <WeekList window={thisWeek} />
      <WeekList window={nextWeek} />
    </div>
  );
}

export function ThisWeek() {
  return (
    <section id="this-week" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Africa/Lagos</p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
          This week and next
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          A week runs Monday through Sunday in Lagos. An event is included when its listed dates overlap. Dates only.
        </p>
        <Suspense fallback={<div className="mt-6"><LoadingLines /></div>}>
          <WeekBody />
        </Suspense>
      </div>
    </section>
  );
}
