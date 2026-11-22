import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Homepage section chrome shared by every block on `/`.
 * - One thin ink rule above each section (no coloured bands).
 * - A numbered mono kicker, e.g. "01 — December 2026".
 * - One square directory card shell and one bordered "See all" control.
 */

/** Same square card as Events and Places: thin border, chart fill, small offset shadow, no radius. */
export const homeCard = "border border-ink/15 bg-chart shadow-[4px_4px_0_0_rgba(184,67,47,0.12)]";

/** Square, bordered, 44px-tall link used for See all / All news. */
export const homeSeeAll =
  "inline-flex min-h-11 shrink-0 items-center border border-ink/25 bg-chart px-4 text-sm font-semibold text-ink hover:text-oxide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxide";

export function HomeSection({
  id,
  number,
  kicker,
  title,
  titleId,
  lede,
  action,
  busy,
  children,
}: {
  id: string;
  /** Two-digit position on the page, e.g. "01". */
  number: string;
  kicker: string;
  title: string;
  /** Defaults to `${id}-heading`. */
  titleId?: string;
  lede?: string;
  action?: { href: string; label: string };
  busy?: boolean;
  children?: ReactNode;
}) {
  const headingId = titleId ?? `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} aria-busy={busy || undefined} className="scroll-mt-36">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-14 lg:pt-14">
        <div className="border-t border-ink pt-4">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-oxide">
                <span>{number}</span> — {kicker}
              </p>
              <h2
                id={headingId}
                className="mt-3 text-balance font-display text-3xl leading-none tracking-tight sm:text-4xl md:text-5xl"
              >
                {title}
              </h2>
            </div>
            {action ? (
              <Link href={action.href} className={homeSeeAll}>
                {action.label}
                <span aria-hidden="true" className="pl-1.5">→</span>
              </Link>
            ) : null}
          </div>
          {lede ? <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{lede}</p> : null}
        </div>
        {children ? <div className="mt-6 lg:mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
