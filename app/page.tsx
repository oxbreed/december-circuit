import { EventCard } from "./components/event-card";
import { GuideSearch } from "./components/guide-search";
import { HomeBands } from "./components/home-bands";
import { events } from "./events";
import { defaultDescription, pageMetadata } from "./site";

export const metadata = pageMetadata({
  title: "December 2026 directory",
  description: defaultDescription,
  path: "/",
});

export default function Home() {
  return (
    <main id="top">
      <GuideSearch />
      <section id="events" className="scroll-mt-36 border-y border-ink/10 bg-paper-deep">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8 md:py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Events</p>
              <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
                On file for December 2026
              </h2>
            </div>
            <a
              href="/events"
              className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide"
            >
              Find by city and date →
            </a>
          </div>
          <div className="mt-6 grid gap-4">
            {events.map((event) => (
              <EventCard key={`${event.region}-${event.when}`} event={event} />
            ))}
          </div>
        </div>
      </section>
      <HomeBands />
    </main>
  );
}
