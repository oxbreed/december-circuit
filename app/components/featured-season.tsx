import { liveHomeFeatures } from "../live-directory";
import { FeaturedSeasonGrid } from "./featured-season-grid";

export async function FeaturedSeason() {
  const featured = await liveHomeFeatures();

  return (
    <section id="featured" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">
          December 2026
        </p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
          Featured this season
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Headline nights and festivals already on file, with their official posters. Save any card
          to My trip in this browser — tickets and organiser pages stay outbound.
        </p>
        {featured.length === 0 ? (
          <div className="mt-6">
            <p className="text-sm leading-7 text-muted">
              No featured events are listed yet.{" "}
              <a
                href="/list"
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                List an event
              </a>{" "}
              for review.
            </p>
          </div>
        ) : (
          <FeaturedSeasonGrid featured={featured} />
        )}
      </div>
    </section>
  );
}

export function FeaturedSeasonFallback() {
  return (
    <section id="featured" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">
          December 2026
        </p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
          Featured this season
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Loading featured events…</p>
      </div>
    </section>
  );
}
