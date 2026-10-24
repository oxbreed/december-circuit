import Link from "next/link";
import { citiesOnFile } from "./cities";
import { ConfirmedEvents } from "./components/confirmed-events";
import { HomeFlights } from "./components/home-flights";
import { HomeHero } from "./components/home-hero";
import { HomeBands } from "./components/home-bands";
import { MyTrip } from "./components/my-trip";
import { ReviewsSection } from "./components/reviews-section";
import { SponsorSpot } from "./components/sponsor-spot";
import { StaysByCity } from "./components/stay-guide";
import { ThisWeek } from "./components/this-week";
import { pageMetadata } from "./site";

export const metadata = pageMetadata({
  title: "Detty December & West Africa directory",
  description:
    "Plan Detty December and West Africa travel with sourced events, places, maps, and outbound booking links for Lagos, Accra, Calabar, and cities on file. Independent directory — no payment on this site.",
  path: "/",
});

const spotlightSlugs = ["lagos", "accra", "calabar"] as const;

export default function Home() {
  const cities = citiesOnFile();
  const spotlight = spotlightSlugs
    .map((slug) => cities.find((city) => city.slug === slug))
    .filter((city): city is NonNullable<typeof city> => Boolean(city));

  return (
    <main id="top">
      <HomeHero />
      <ThisWeek />
      <ConfirmedEvents />

      <section id="cities" className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">
                Cities on file
              </p>
              <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
                Lagos, Accra, Calabar
              </h2>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <Link
                href="/detty-december"
                className="text-[11px] uppercase tracking-[0.18em] text-oxide"
              >
                Detty December hub →
              </Link>
              <Link
                href="/west-africa"
                className="text-[11px] uppercase tracking-[0.18em] text-oxide"
              >
                West Africa year-round →
              </Link>
              <Link
                href="/cities"
                className="text-[11px] uppercase tracking-[0.18em] text-oxide"
              >
                All cities →
              </Link>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            Open a city for organiser pages and any confirmed events already listed. Coverage
            spans West Africa tourism hubs beyond these three — booking always leaves this site.
          </p>
          <ul className="mt-2 grid gap-3 sm:grid-cols-3">
            {spotlight.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/cities/${city.slug}`}
                  className="block border border-ink/15 bg-chart px-4 py-5 hover:border-oxide/40"
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                    {city.country}
                  </p>
                  <p className="mt-2 font-display text-3xl leading-none tracking-tight">
                    {city.city}
                  </p>
                  <p className="mt-3 text-sm text-muted">
                    {city.events.length > 0
                      ? `${city.events.length} confirmed ${
                          city.events.length === 1 ? "event" : "events"
                        }`
                      : "Organiser pages"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <MyTrip />
      <StaysByCity />
      <HomeFlights />
      <HomeBands />
      <section id="news" className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">News</p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
              Entertainment headlines
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              Headlines and pictures from the public feeds already used for the ticker.
              Opening an item leaves this site.
            </p>
          </div>
          <Link
            href="/news"
            className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide"
          >
            Open the news page →
          </Link>
        </div>
      </section>
      <SponsorSpot />
      <ReviewsSection />
    </main>
  );
}
