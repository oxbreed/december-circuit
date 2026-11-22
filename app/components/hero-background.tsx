import type { HeroStagePoster } from "../home-hero-slides";

/**
 * Background layer behind the whole hero (edge to edge). Site paper, not a darkened
 * poster wash: the slideshow and sharp posters sit on the same cream palette as the rest
 * of the page. `posters` / `index` / `mounted` stay in the signature so the carousel
 * can keep passing the current slide without a wider rewrite.
 */
export function HeroBackground({
  posters,
  index,
  mounted,
}: {
  posters: HeroStagePoster[];
  index: number;
  mounted: ReadonlySet<number>;
}) {
  void posters;
  void index;
  void mounted;
  return <div aria-hidden="true" className="absolute inset-0 -z-10 bg-paper" />;
}
