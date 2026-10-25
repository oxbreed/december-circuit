import { FlightsSection } from "../components/flights-section";
import { GetAroundRidesSection } from "../components/get-around-rides";
import { flightSearches } from "../flights";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Flights to Lagos, Accra & more",
  description:
    "Outbound Google Flights searches toward Lagos, Accra, Calabar, and other listed airports for Detty December and West Africa travel. Searches only — not fares, seats, or bookings on this site. Adjacent links to third-party ride apps Bolt and inDrive for getting around.",
  path: "/flights",
});

export default function FlightsPage() {
  return (
    <main id="top" className="pb-28 lg:pb-0">
      <FlightsSection records={flightSearches} />
      <GetAroundRidesSection />
    </main>
  );
}
