import { connection } from "next/server";
import { Suspense } from "react";
import { presentEvent } from "../event-view";
import { upcomingEventsFrom } from "../upcoming-events";
import { HomeSection } from "./home-section";
import { LoadingLines } from "./states";
import { UpcomingHomeList } from "./upcoming-home-list";

async function UpcomingBody() {
  await connection();
  const rows = upcomingEventsFrom(new Date()).slice(0, 5).map((event) => {
    const { href, name, region } = presentEvent(event);
    return { href, name, region, when: event.when };
  });
  return <UpcomingHomeList rows={rows} />;
}

export function UpcomingHome() {
  return (
    <HomeSection
      id="upcoming"
      number="02"
      kicker="Event calendar"
      title="Upcoming events"
      lede="The next five events on the calendar."
      action={{ href: "/events", label: "See all events" }}
    >
      <Suspense fallback={<LoadingLines />}>
        <UpcomingBody />
      </Suspense>
    </HomeSection>
  );
}
