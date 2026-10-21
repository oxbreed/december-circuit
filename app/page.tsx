import { EventsSection } from "./components/events-section";
import { GuideSearch } from "./components/guide-search";
import { HomeBands } from "./components/home-bands";

export default function Home() {
  return (
    <main id="top">
      <GuideSearch />
      <EventsSection rail />
      <HomeBands />
    </main>
  );
}
