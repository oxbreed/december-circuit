import Link from "next/link";
import type { HeroStagePoster } from "../home-hero-slides";

/**
 * Date, place, title and credit for one slide. Sits beside (or under) the poster on the
 * paper backdrop, never over the artwork. Ink, lagoon and muted so the type stays above
 * WCAG AA (4.5:1) on paper and chart.
 */
export function HeroCaption({ poster }: { poster: HeroStagePoster }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center lg:flex-none lg:pt-4">
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
    </div>
  );
}
