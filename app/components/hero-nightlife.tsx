"use client";

import { lazy, Suspense, useState, type KeyboardEvent, type ReactNode } from "react";
import type { HeroSlide } from "../hero-nightlife";

const LaterImage = lazy(() => import("./hero-slide").then((module) => ({ default: module.HeroSlideImage })));
const LaterCaption = lazy(() => import("./hero-slide").then((module) => ({ default: module.HeroSlideCaption })));

const controlClass =
  "inline-flex items-center justify-center min-h-11 rounded-sm border border-ink/20 bg-chart px-3 text-xs font-medium text-ink hover:border-oxide hover:text-oxide";

export function HeroNightlife({
  slides,
  firstImage,
  firstCaption,
}: {
  slides: HeroSlide[];
  firstImage: ReactNode;
  firstCaption: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const count = slides.length + 1;
  const slide = slides[index - 1];

  function go(step: number) {
    setIndex((current) => (current + step + count) % count);
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  }

  return (
    <figure
      className="min-w-0 overflow-hidden rounded-xl border border-ink/15 bg-chart shadow-sm"
      aria-roledescription="carousel"
      aria-label="December event posters and West African nights"
      onKeyDown={onKeyDown}
    >
      <div className="relative h-48 w-full overflow-hidden bg-ink sm:h-64 xl:h-72">
        <Suspense fallback={firstImage}>
          {slide ? <LaterImage key={slide.src} slide={slide} /> : firstImage}
        </Suspense>
      </div>
      <figcaption className="border-t border-ink/10 bg-chart">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0 flex-1 basis-48" aria-live="polite">
            <Suspense fallback={firstCaption}>
              {slide ? <LaterCaption slide={slide} /> : firstCaption}
            </Suspense>
          </div>
          {count > 1 && <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Slideshow controls">
            <button type="button" className={controlClass} onClick={() => go(-1)}>
              Previous
            </button>
            <button type="button" className={controlClass} onClick={() => go(1)}>
              Next
            </button>
            <span className="pl-1 text-[10px] uppercase tracking-[0.16em] text-muted">
              {index + 1} / {count}
            </span>
          </div>}
        </div>
      </figcaption>
    </figure>
  );
}
