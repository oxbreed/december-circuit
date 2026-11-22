const buttonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border border-ink/25 bg-chart px-3 text-sm font-semibold text-ink hover:border-ink hover:text-oxide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d={dir === "prev" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}

function PlayPauseIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <rect x="3.5" y="2.5" width="3" height="11" />
      <rect x="9.5" y="2.5" width="3" height="11" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M4 2.5v11l9-5.5Z" />
    </svg>
  );
}

/**
 * Previous / Next, a pause/play control, and an "n of N" status. In normal flow under the slide
 * (never fixed), so on a phone it scrolls in above the fixed bottom bar and the Ask Support pill
 * instead of under them.
 */
export function HeroControls({
  index,
  count,
  playing,
  onPrev,
  onNext,
  onTogglePlay,
}: {
  index: number;
  count: number;
  /** True when the slideshow will auto-advance (unless hovered or the tab is hidden). */
  playing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
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
      <button
        type="button"
        onClick={onTogglePlay}
        className={buttonClass}
        aria-label={playing ? "Pause slideshow" : "Play slideshow"}
        aria-pressed={playing}
      >
        <PlayPauseIcon playing={playing} />
      </button>
      <p role="status" aria-live="polite" aria-atomic="true" className="ml-auto font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        <span className="sr-only">Poster </span>
        {index + 1} of {count}
      </p>
    </div>
  );
}
