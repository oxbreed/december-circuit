import Link from "next/link";
import { ConfirmedEvents } from "./components/confirmed-events";
import { HomeFlights } from "./components/home-flights";
import { HomeHero } from "./components/home-hero";
import { HomeBands } from "./components/home-bands";
import { MyTrip } from "./components/my-trip";
import { ReviewsSection } from "./components/reviews-section";
import { SponsorSpot } from "./components/sponsor-spot";
import { StaysByCity } from "./components/stay-guide";
import { ThisWeek } from "./components/this-week";
import { defaultDescription, pageMetadata } from "./site";

export const metadata = pageMetadata({
  title: "December 2026 directory",
  description: defaultDescription,
  path: "/",
});

export default function Home() {
  return (
    <main id="top">
      <HomeHero />
      <ThisWeek />
      <ConfirmedEvents />
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
