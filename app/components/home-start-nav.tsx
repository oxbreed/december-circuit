import { visitorCategoryEntries } from "../visitor-categories";
import { HomeCategoryStrip } from "./home-category-strip";
import { HomeSection } from "./home-section";

const homePlaceCategories = new Set(["Hotels", "Restaurants", "Clubs", "Short-stay"]);

export function HomeStartNav() {
  const categories = visitorCategoryEntries().filter((row) => homePlaceCategories.has(row.category));

  return (
    <HomeSection
      id="start-here"
      number="02"
      kicker="Where to go"
      title="Explore places"
      titleId="home-start-heading"
      lede="Find somewhere to stay, eat, or go out."
      action={{ href: "/places", label: "Browse all places" }}
    >
      <HomeCategoryStrip entries={categories} />
    </HomeSection>
  );
}
