import { EventsSection } from "./components/events-section";
import { Hero } from "./components/hero";
import { HomeBands } from "./components/home-bands";

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <EventsSection rail />
      <HomeBands />
    </main>
  );
}
