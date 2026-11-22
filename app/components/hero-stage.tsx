import type { ReactNode } from "react";
import type { HeroStagePoster } from "../home-hero-slides";
import { HeroPoster } from "./hero-poster";

/**
 * The poster side of the homepage hero. A small, swappable seam:
 * - `poster`: the current slide (see `heroStagePosters()` in home-hero-slides.ts).
 * - `controls`: optional Previous/Next/dots. Rendered in normal flow *below* the poster, never
 *   fixed or absolute, so on mobile they scroll above the 58px dock instead of under it.
 *   Empty while the hero is one poster.
 * The blurred full-bleed background lives in `HeroBackground` (a sibling layer in HomeHero).
 */
export function HeroStage({ poster, controls }: { poster: HeroStagePoster; controls?: ReactNode }) {
  return (
    <div className="min-w-0">
      <HeroPoster poster={poster} priority />
      {controls ? <div className="mt-3 flex items-center justify-between gap-3 pb-1 lg:ml-auto lg:max-w-[22rem]">{controls}</div> : null}
    </div>
  );
}
