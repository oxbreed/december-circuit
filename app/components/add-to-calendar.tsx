"use client";

import type { CalendarLinks } from "../event-calendar";

export function AddToCalendar({ links }: { links: CalendarLinks }) {
  function downloadIcs() {
    const blob = new Blob([links.ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = links.icsFilename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <a
        href={links.googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex border border-ink/20 bg-paper px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-ink hover:border-oxide hover:text-oxide"
      >
        Google Calendar
      </a>
      <button
        type="button"
        onClick={downloadIcs}
        className="inline-flex border border-ink/20 bg-paper px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-ink hover:border-oxide hover:text-oxide"
      >
        Download .ics
      </button>
      <p className="text-xs leading-6 text-muted">
        All-day from the sourced dates on file — no start time is invented here.
      </p>
    </div>
  );
}
