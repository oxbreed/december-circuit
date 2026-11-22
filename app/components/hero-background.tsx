import Image from "next/image";
import type { HeroStagePoster } from "../home-hero-slides";

/**
 * Full-bleed backdrop behind the whole hero (edge to edge, behind the header too), one layer per
 * slide, crossfaded with the poster. Each layer is a tiny copy of the poster (next/image, ~96px
 * wide, a few KB), stretched to cover, blurred and saturated with CSS. One shared ink/oxide grade
 * sits on top so cream text clears WCAG AA on any poster. Layers for slides that have not been
 * needed yet render no image (`mounted` false) so only slide one is downloaded up front.
 *
 * Positioned against the hero `<section>` (`relative isolate`), so it needs no wrapper of its own.
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
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-ink">
      {posters.map((poster, i) => (
        <div
          key={poster.src}
          className={`absolute inset-0 transition-[opacity,visibility] duration-[400ms] motion-reduce:transition-none ${
            i === index ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          {mounted.has(i) ? (
            <Image
              src={poster.src}
              alt=""
              fill
              sizes="96px"
              quality={40}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "low" : undefined}
              className="scale-125 object-cover blur-2xl saturate-[1.6]"
              draggable={false}
            />
          ) : null}
        </div>
      ))}
      <div className="absolute inset-0 bg-ink/72" />
      <div className="absolute inset-0 bg-gradient-to-br from-oxide/40 via-transparent to-ink/30" />
    </div>
  );
}
