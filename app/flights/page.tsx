import type { Metadata } from "next";
import { FlightsSection } from "../components/flights-section";

export const metadata: Metadata = {
  title: "Flights · dirtydecember.info",
  description: "Outbound Google Flights searches. Not fares or seats.",
};

export default function FlightsPage() {
  return (
    <main id="top" className="pb-24 pt-8 lg:pb-0">
      <FlightsSection />
    </main>
  );
}
