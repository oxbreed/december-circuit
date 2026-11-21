import Link from "next/link";
import { visitorCategoryEntries } from "../visitor-categories";
import { HomeCategoryStrip } from "./home-category-strip";

const homePlaceCategories = new Set(["Hotels", "Restaurants", "Clubs", "Short-stay"]);

export function HomeStartNav() {
  const categories = visitorCategoryEntries().filter((row) => homePlaceCategories.has(row.category));

  return (
    <section
      id="start-here"
      aria-labelledby="home-start-heading"
      className="scroll-mt-36 border-b border-ink/10 bg-paper-deep/40"
    >
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="home-start-heading" className="font-display text-4xl leading-none tracking-tight md:text-5xl">
              Explore places
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">Find somewhere to stay, eat, or go out.</p>
          </div>
          <Link href="/places" className="inline-flex min-h-11 items-center text-sm font-semibold text-oxide underline underline-offset-4">
            Browse all places
          </Link>
        </div>
        <HomeCategoryStrip entries={categories} />
      </div>
    </section>
  );
}
