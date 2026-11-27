import Link from "next/link";
import { disclaimer } from "../../brand";
import { citiesOnFile } from "../../cities";
import { EventDateList, sortByStart } from "../../components/event-date-list";
import { JsonLd } from "../../components/json-ld";
import { SeasonGuideShell } from "../../components/season-guide-chrome";
import { eventDateSpan } from "../../event-dates";
import { events } from "../../events";
import { breadcrumbJsonLd, eventsItemListJsonLd, webPageJsonLd } from "../../jsonld";
import { pageMetadata } from "../../site";

const path = "/detty-december/calendar";

export const metadata = pageMetadata({
  title: "Detty December 2026 calendar",
  description:
    "Every confirmed Detty December 2026 event by date and city, from late November to early January, with links to each event page.",
  path,
  type: "article",
});

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const linkClass =
  "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

export default function DettyDecemberCalendarPage() {
  const sorted = sortByStart(events);
  const groups = new Map<string, typeof sorted>();
  for (const event of sorted) {
    const start = eventDateSpan(event.when)?.start;
    const key = start
      ? `${monthNames[Number(start.slice(5, 7)) - 1]} ${start.slice(0, 4)}`
      : "Dates to confirm";
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  const regions = [...new Set(events.map((event) => event.region))];
  const cities = citiesOnFile().filter((city) => regions.includes(city.city));
  const description = `${events.length} confirmed events in ${regions.length} places, listed by start date.`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Detty December", path: "/detty-december" },
          { name: "Calendar", path },
        ])}
      />
      <JsonLd data={webPageJsonLd({ path, name: "Detty December 2026 calendar", description })} />
      <JsonLd data={eventsItemListJsonLd(sorted, "Detty December 2026 events by date")} />
      <SeasonGuideShell
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Detty December", href: "/detty-december" },
          { name: "Calendar" },
        ]}
        kicker="Every confirmed event · by date"
        title={
          <>
            Detty December <span className="italic text-oxide">2026</span> calendar
          </>
        }
        lede={
          <>
            {description} Each row opens the event page with the source, venue and ticket link
            where one is on file. {disclaimer}
          </>
        }
        currentPath={path}
      >
        <nav aria-label="Calendar months" className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {[...groups.keys()].map((key) => (
            <a key={key} href={`#${key.replace(/\s+/g, "-").toLowerCase()}`} className={linkClass}>
              {key} ({groups.get(key)?.length})
            </a>
          ))}
        </nav>

        {[...groups.entries()].map(([key, list]) => (
          <section
            key={key}
            id={key.replace(/\s+/g, "-").toLowerCase()}
            className="mt-12 border-t border-ink/10 pt-10"
          >
            <h2 className="font-display text-3xl tracking-tight">{key}</h2>
            <div className="mt-6">
              <EventDateList list={list} />
            </div>
          </section>
        ))}

        <section className="mt-14 border-t border-ink/10 pt-10">
          <h2 className="font-display text-3xl tracking-tight">Browse by city</h2>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link href={`/cities/${city.slug}`} className={linkClass}>
                  {city.city} ({city.events.length})
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-7 text-muted">
            <Link href="/events" className={linkClass}>Filter all events</Link>
            {" · "}
            <Link href="/guides/things-to-do-in-lagos-in-december-2026" className={linkClass}>
              Things to do in Lagos
            </Link>
            {" · "}
            <Link href="/guides/detty-december-ticket-safety-2026" className={linkClass}>
              Ticket safety
            </Link>
            {" · "}
            <Link href="/map" className={linkClass}>Map</Link>
          </p>
        </section>
      </SeasonGuideShell>
    </>
  );
}
