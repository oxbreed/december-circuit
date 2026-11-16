"use client";

import type { FlightSearch } from "../flights";
import { seasonSearchNote } from "../flights";
import { FlightBoardLoadMore } from "./flight-board-load-more";
import { SectionIntro, sectionClass } from "./section-intro";
import { ErrorNote, LoadingLines } from "./states";
import { useRecords } from "./use-records";

export function FlightsSection({ records }: { records?: FlightSearch[] }) {
  const remote = useRecords<FlightSearch[]>("/api/flights");
  const ready = records ?? (remote.status === "ready" ? remote.data : null);

  return (
    <section id="flights" className={sectionClass}>
      <SectionIntro
        kicker="Flights"
        title="Search links"
        lede={`Each row opens a Google Flights search. It is a search, not a fare, a seat, or a booking. ${seasonSearchNote}`}
      />
      {ready ? <FlightBoardLoadMore flights={ready} /> : null}
      {!records && remote.status === "loading" ? <LoadingLines /> : null}
      {!records && remote.status === "error" ? (
        <ErrorNote message="Flight searches did not load." onRetry={remote.retry} />
      ) : null}
    </section>
  );
}
