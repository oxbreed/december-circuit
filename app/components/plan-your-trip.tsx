import { HomeSection } from "./home-section";
import { MyTripAccountSlot, MyTripShell } from "./my-trip-shell";
import { QuickHubs } from "./quick-hubs";

/** One Plan your trip section: travel guides beside the visitor's saved trip. */
export function PlanYourTrip() {
  return (
    <HomeSection
      id="trip"
      number="04"
      kicker="Travel guides and your trip"
      title="Plan your trip"
      lede="Guides for getting there and around, and the events and places you have saved."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
        <QuickHubs />
        <MyTripShell />
      </div>
      <MyTripAccountSlot />
    </HomeSection>
  );
}
