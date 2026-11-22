import Image from "next/image";
import Link from "next/link";
import type { HeroStagePoster } from "../home-hero-slides";

/**
 * The sharp event poster, on its own: a square-cornered 4:5 frame, nothing over the artwork.
 * The caption lives in `HeroCaption` and the blurred backdrop in `HeroBackground`, so the poster
 * can be swapped or restyled without touching either. The frame has a fixed aspect ratio, so the
 * image never shifts the layout. Pass `priority` for slide one only (it is the LCP image); every
 * other slide is lazy.
 */
export function HeroPoster({
  poster,
  priority = false,
  load = true,
}: {
  poster: HeroStagePoster;
  priority?: boolean;
  /** False renders the empty frame only, until this slide is needed. */
  load?: boolean;
}) {
  return (
    <Link
      href={poster.href}
      prefetch={false}
      tabIndex={-1}
      aria-hidden="true"
      className="relative block aspect-[4/5] w-[46vw] max-w-[13.5rem] shrink-0 overflow-hidden border border-chart/30 bg-ink shadow-[6px_6px_0_0_rgba(0,0,0,0.38)] sm:w-56 sm:max-w-none lg:w-full lg:max-w-[20rem]"
    >
      {load ? (
      <Image
        src={poster.src}
        alt={poster.alt}
        fill
        preload={priority}
        loading={priority ? undefined : "lazy"}
        sizes="(max-width: 639px) 46vw, (max-width: 1023px) 224px, 320px"
        className="object-cover"
        draggable={false}
        style={poster.objectPosition ? { objectPosition: poster.objectPosition } : undefined}
      />
      ) : null}
    </Link>
  );
}
