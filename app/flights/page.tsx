import { FlightsSection } from "../components/flights-section";
import { flightSearches } from "../flights";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Flights",
  description: "Outbound Google Flights searches. Not fares or seats.",
  path: "/flights",
});

export default function FlightsPage() {
  return (
    <main id="top" className="pb-28 lg:pb-0">
      <FlightsSection records={flightSearches} />
    </main>
  );
}
