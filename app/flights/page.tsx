import { FlightsSection } from "../components/flights-section";
import { GetAroundRidesSection } from "../components/get-around-rides";
import { FlightPartners, StayPartners } from "../components/partner-modules";
import { flightSearches } from "../flights";
import { pageMetadata } from "../site";
import { JsonLd } from "../components/json-ld";
import { breadcrumbJsonLd } from "../jsonld";

export const metadata = pageMetadata({
  title: "Flights to Lagos, Accra & more",
  description:
    "Outbound Google Flights searches toward Lagos, Accra, Calabar, and other listed airports for Detty December and West Africa travel. Searches only — not fares, seats, or bookings on this site. Adjacent links to third-party ride apps Bolt and inDrive for getting around.",
  path: "/flights",
});

export default function FlightsPage() {
  return (
    <main id="top" className="pb-28 lg:pb-0">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Flights", path: "/flights" }])} />
      <h1 className="sr-only">Flights to Lagos, Accra and Abuja for Detty December 2026</h1>
      <FlightsSection records={flightSearches} />
      <section id="book" aria-label="Book flights and stays" className="mx-auto w-full min-w-0 max-w-6xl px-5 pb-12 md:px-8">
        <FlightPartners placement="flights-board" className="mt-2" />
        <StayPartners placement="flights-stays" heading="Where to stay when you land" />
      </section>
      <GetAroundRidesSection />
    </main>
  );
}
