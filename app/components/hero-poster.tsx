import Image from "next/image";
import Link from "next/link";
import type { HeroStagePoster } from "../home-hero-slides";

/**
 * One event poster in a sharp 4:5 frame with its caption.
 * On a 375px screen the poster is about half the viewport wide so it has real
 * presence, with the caption beside it, and Featured still fits on the first screen.
 * From `lg` it becomes a stacked 4:5 card. The image is the LCP element: pass `priority` for slide one.
 */
export function HeroPoster({ poster, priority = false }: { poster: HeroStagePoster; priority?: boolean }) {
  return (
    <figure className="flex min-w-0 flex-row items-stretch gap-3 border border-ink/15 bg-chart p-2 shadow-[4px_4px_0_0_rgba(184,67,47,0.12)] sm:gap-4 sm:p-2.5 lg:ml-auto lg:max-w-[22rem] lg:flex-col lg:gap-0">
      <Link
        href={poster.href}
        prefetch={false}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[4/5] w-[46vw] max-w-[13.5rem] shrink-0 overflow-hidden bg-ink sm:w-56 sm:max-w-none lg:w-full lg:max-w-none"
      >
        <Image
          src={poster.src}
          alt={poster.alt}
          fill
          preload={priority}
          sizes="(max-width: 639px) 46vw, (max-width: 1023px) 224px, 352px"
          className="object-cover"
          style={poster.objectPosition ? { objectPosition: poster.objectPosition } : undefined}
        />
      </Link>
      <figcaption className="flex min-w-0 flex-1 flex-col justify-center py-1 lg:px-1 lg:pb-1 lg:pt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-lagoon">
          {poster.date} · {poster.place}
        </p>
        <p className="mt-1.5 font-display text-lg leading-tight tracking-tight text-ink lg:text-xl">
          <Link href={poster.href} prefetch={false} className="hover:text-oxide">
            {poster.title}
          </Link>
        </p>
        <p className="mt-1.5 text-[11px] leading-4 text-muted">
          {poster.creditUrl ? (
            <a
              href={poster.creditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-ink/25 underline-offset-2 hover:text-oxide"
            >
              {poster.credit ?? "Image source"}
              <span className="sr-only"> (leaves this site)</span>
            </a>
          ) : (
            (poster.credit ?? "Event poster")
          )}
        </p>
      </figcaption>
    </figure>
  );
}
