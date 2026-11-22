const buttonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border border-chart/45 bg-ink/40 px-3 text-sm font-semibold text-chart hover:bg-chart hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart";

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d={dir === "prev" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}

/**
 * Previous / Next and an "n of N" status. In normal flow under the slide (never fixed), so on a
 * phone it scrolls in above the fixed bottom bar and the Ask Support pill instead of under them.
 */
export function HeroControls({
  index,
  count,
  onPrev,
  onNext,
}: {
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <button type="button" onClick={onPrev} className={buttonClass}>
        <Arrow dir="prev" />
        <span>Previous<span className="sr-only"> poster</span></span>
      </button>
      <button type="button" onClick={onNext} className={buttonClass}>
        <span>Next<span className="sr-only"> poster</span></span>
        <Arrow dir="next" />
      </button>
      <p role="status" aria-live="polite" aria-atomic="true" className="ml-auto font-mono text-[11px] uppercase tracking-[0.16em] text-chart/90">
        <span className="sr-only">Poster </span>
        {index + 1} of {count}
      </p>
    </div>
  );
}
