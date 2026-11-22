import Link from "next/link";
import type { HeroStagePoster } from "../home-hero-slides";

/**
 * Date, place, title and credit for one slide. Sits on the blurred, ink-graded backdrop (never over
 * the poster), in cream and light amber so it stays above WCAG AA (4.5:1) whatever the poster colours.
 */
export function HeroCaption({ poster }: { poster: HeroStagePoster }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center lg:flex-none lg:pt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c999]">
        {poster.date} · {poster.place}
      </p>
      <p className="mt-1.5 font-display text-lg leading-tight tracking-tight text-chart lg:text-xl">
        <Link href={poster.href} prefetch={false} className="hover:underline hover:decoration-[#f8c999] hover:underline-offset-4">
          {poster.title}
        </Link>
      </p>
      <p className="mt-1.5 text-[11px] leading-4 text-chart/80">
        {poster.creditUrl ? (
          <a
            href={poster.creditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-chart/40 underline-offset-2 hover:text-chart"
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
