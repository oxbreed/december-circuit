import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "../components/breadcrumbs";
import { EventsDirectory } from "../components/events-directory";
import { LoadingLines } from "../components/states";
import { eventSlug, presentEvent } from "../event-view";
import { events } from "../events";
import { JsonLd } from "../components/json-ld";
import { breadcrumbJsonLd } from "../jsonld";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Confirmed Detty December events",
  description:
    "Confirmed December 2026 events on file for Lagos, Calabar, Ghana, and other regions listed — parties, festivals, and season dates from organiser pages or named reports. Tickets leave this site.",
  path: "/events",
});

export default function EventsPage() {
  const listed = events.map((event) => {
    const view = presentEvent(event);
    return { event, view, href: `/events/${eventSlug(event)}` };
  });

  return (
    <main id="top" className="pb-28 lg:pb-0">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
        ])}
      />
      <div className="mx-auto w-full max-w-6xl px-5 pt-28 md:px-8 md:pt-36">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Events" },
          ]}
        />
      </div>

      {/* Crawlable index — always in HTML for search and answer engines */}
      <section
        aria-label="Confirmed events on file"
        className="mx-auto w-full max-w-6xl px-5 pb-2 md:px-8"
      >
        <h2 className="sr-only">Confirmed events on file</h2>
        <ol className="sr-only">
          {listed.map(({ event, view, href }) => (
            <li key={href}>
              <Link href={href}>
                {view.name}
              </Link>
              <span>
                {" "}
                — {event.when}, {view.region}
                {view.venue ? `, ${view.venue}` : ""}
              </span>
            </li>
          ))}
        </ol>
        <p className="sr-only">
          <Link href="/cities">Cities</Link>
          {" · "}
          <Link href="/guide">Tourist guide</Link>
          {" · "}
          <Link href="/faq">FAQ</Link>
          {" · "}
          <Link href="/map">Map</Link>
          {" · "}
          <Link href="/list">List an event</Link>
        </p>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-5 pt-8">
            <LoadingLines />
          </div>
        }
      >
        <EventsDirectory />
      </Suspense>
    </main>
  );
}
