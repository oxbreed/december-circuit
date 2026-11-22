import { liveHomeFeatures } from "../live-directory";
import { FeaturedSeasonGrid } from "./featured-season-grid";
import { HomeSection } from "./home-section";

const lede = "Discover headline concerts and festivals, then save your favourites to My trip.";

export async function FeaturedSeason() {
  const featured = await liveHomeFeatures();

  return (
    <HomeSection
      id="featured"
      number="01"
      kicker="December 2026"
      title="Featured this season"
      titleId="featured-heading"
      lede={lede}
      action={{ href: "/events", label: "All events" }}
    >
      {featured.length === 0 ? (
        <p className="text-sm leading-7 text-muted">
          No featured events are listed yet.{" "}
          <a href="/list" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            List an event
          </a>{" "}
          for review.
        </p>
      ) : (
        <FeaturedSeasonGrid featured={featured} />
      )}
    </HomeSection>
  );
}

export function FeaturedSeasonFallback() {
  return (
    <HomeSection
      id="featured"
      number="01"
      kicker="December 2026"
      title="Featured this season"
      titleId="featured-heading"
      lede="Loading featured events…"
    />
  );
}
