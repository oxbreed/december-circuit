"use client";

import { lazy, Suspense, useState, type KeyboardEvent, type ReactNode } from "react";
import type { HeroSlide } from "../hero-nightlife";

const LaterImage = lazy(() => import("./hero-slide").then((module) => ({ default: module.HeroSlideImage })));
const LaterCaption = lazy(() => import("./hero-slide").then((module) => ({ default: module.HeroSlideCaption })));

const controlClass =
  "inline-flex min-h-11 items-center justify-center rounded-sm border border-ink/20 bg-chart px-3 text-xs font-medium text-ink hover:border-oxide hover:text-oxide disabled:opacity-60";

export function HeroNightlife({
  count,
  firstImage,
  firstCaption,
}: {
  count: number;
  firstImage: ReactNode;
  firstCaption: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const total = slides ? slides.length + 1 : count;
  const slide = slides?.[index - 1];

  async function go(step: number) {
    if (loading || total < 2) return;
    if (slides) {
      setIndex((current) => (current + step + total) % total);
      return;
    }

    setLoading(true);
    setFailed(false);
    try {
      const [response] = await Promise.all([fetch("/api/home/slides"), import("./hero-slide")]);
      if (!response.ok) throw new Error("Slideshow unavailable");
      const items: HeroSlide[] = await response.json();
      setSlides(items);
      setIndex(step > 0 ? Math.min(1, items.length) : items.length);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    void go(event.key === "ArrowRight" ? 1 : -1);
  }

  return (
    <figure
      className="min-w-0 overflow-hidden rounded-xl border border-ink/15 bg-chart shadow-sm"
      aria-roledescription="carousel"
      aria-label="December event posters and West African nights"
      onKeyDown={onKeyDown}
    >
      <div className="relative h-48 w-full overflow-hidden bg-ink sm:h-64 xl:h-72">
        {slide ? (
          <Suspense fallback={firstImage}>
            <LaterImage key={slide.src} slide={slide} />
          </Suspense>
        ) : firstImage}
      </div>
      <figcaption className="border-t border-ink/10 bg-chart px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1 basis-48" aria-live="polite">
            {slide ? <Suspense fallback={firstCaption}><LaterCaption slide={slide} /></Suspense> : firstCaption}
          </div>
          {total > 1 && (
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Slideshow controls" aria-busy={loading}>
              <button type="button" className={controlClass} disabled={loading} onClick={() => void go(-1)}>Previous</button>
              <button type="button" className={controlClass} disabled={loading} onClick={() => void go(1)}>Next</button>
              <span className="pl-1 text-xs text-muted">{index + 1} / {total}</span>
            </div>
          )}
        </div>
        {failed && <p role="status" className="mt-2 text-sm text-muted">Could not load the other posters. Try again.</p>}
      </figcaption>
    </figure>
  );
}
