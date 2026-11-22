import type { HeroStagePoster } from "../home-hero-slides";
import { HeroCaption } from "./hero-caption";
import { HeroPoster } from "./hero-poster";

/**
 * The poster side of the hero: every slide (poster + caption) stacked in one grid cell, so the
 * stage is as tall as the tallest slide and changing slides never moves the page (CLS 0). The
 * active slide fades in over 400ms (instant under prefers-reduced-motion); the others are
 * `inert` and hidden from assistive tech. Images for slides that have not been needed yet
 * (`mounted`) are not rendered, so they download only after the visitor first engages.
 */
export function HeroStage({
  posters,
  index,
  mounted,
}: {
  posters: HeroStagePoster[];
  index: number;
  mounted: ReadonlySet<number>;
}) {
  return (
    <div className="grid min-w-0 lg:ml-auto lg:max-w-[20rem]">
      {posters.map((poster, i) => {
        const active = i === index;
        return (
          <div
            key={poster.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${posters.length}: ${poster.title}`}
            aria-hidden={active ? undefined : true}
            inert={!active}
            className={`col-start-1 row-start-1 flex min-w-0 flex-row items-stretch gap-4 transition-[opacity,visibility] duration-[400ms] motion-reduce:transition-none lg:flex-col lg:gap-0 ${
              active ? "visible opacity-100" : "invisible opacity-0"
            }`}
          >
            <HeroPoster poster={poster} priority={i === 0} load={mounted.has(i)} />
            <HeroCaption poster={poster} />
          </div>
        );
      })}
    </div>
  );
}
