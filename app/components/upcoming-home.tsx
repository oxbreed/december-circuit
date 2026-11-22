import { connection } from "next/server";
import { Suspense } from "react";
import { presentEvent } from "../event-view";
import { upcomingEventsFrom } from "../upcoming-events";
import { HomeSection } from "./home-section";
import { LoadingLines } from "./states";
import { UpcomingHomeList } from "./upcoming-home-list";

async function UpcomingBody() {
  await connection();
  const rows = upcomingEventsFrom(new Date()).slice(0, 3).map((event) => {
    const { href, name, region } = presentEvent(event);
    return { href, name, region, when: event.when };
  });
  return <UpcomingHomeList rows={rows} />;
}

export function UpcomingHome() {
  return (
    <HomeSection
      id="upcoming"
      number="04"
      kicker="Event calendar"
      title="Next on the calendar"
      lede="The next three events, by date."
      action={{ href: "/events", label: "See all events" }}
    >
      <Suspense fallback={<LoadingLines />}>
        <UpcomingBody />
      </Suspense>
    </HomeSection>
  );
}
