import type { HeroStagePoster } from "../home-hero-slides";

/**
 * Background layer behind the whole hero (edge to edge). Flat paper for now.
 * Follow-up (locked carousel Option C): render the same, already preloaded `poster.src` here
 * with `object-cover` and a CSS blur/colour-grade filter, so the page never downloads it twice.
 * `poster` is accepted now so that change is local to this file.
 */
export function HeroBackground({ poster }: { poster?: HeroStagePoster }) {
  void poster;
  return <div aria-hidden="true" className="absolute inset-0 -z-10 bg-paper" />;
}
