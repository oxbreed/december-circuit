import type { Metadata } from "next";
import { EventsSection } from "../components/events-section";

export const metadata: Metadata = {
  title: "Events · dirtydecember.info",
  description: "Confirmed December 2026 events already on file.",
};

export default function EventsPage() {
  return (
    <main id="top" className="pb-24 pt-8 lg:pb-0">
      <EventsSection />
    </main>
  );
}
