import { Suspense } from "react";
import { FeaturedSeason, FeaturedSeasonFallback } from "./components/featured-season";
import { HomeHero } from "./components/home-hero";
import { HomeNewsCard, HomeNewsFallback } from "./components/home-news-card";
import { HomeStartNav } from "./components/home-start-nav";
import { MyTripShell } from "./components/my-trip-shell";
import { QuickHubs } from "./components/quick-hubs";
import { UpcomingHome } from "./components/upcoming-home";
import { pageMetadata } from "./site";

export const metadata = pageMetadata({
  title: "Detty December & West Africa directory",
  description:
    "Independent directory for Detty December and West Africa — sourced events, places, and trip planning. Browse confirmed events, explore places, or open the tourist guide. Outbound booking only.",
  path: "/",
});

export default function Home() {
  return (
    <main id="top">
      <HomeHero />
      <HomeStartNav />
      <Suspense fallback={<FeaturedSeasonFallback />}>
        <FeaturedSeason />
      </Suspense>
      <QuickHubs />
      <UpcomingHome />
      <Suspense fallback={<HomeNewsFallback />}>
        <HomeNewsCard />
      </Suspense>
      {/* Saved items stay reachable from sign-in (/#trip) without cluttering the first-screen job. */}
      <MyTripShell />
    </main>
  );
}
