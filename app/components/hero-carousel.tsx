"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import type { HeroStagePoster } from "../home-hero-slides";
import { HeroBackground } from "./hero-background";
import { HeroControls } from "./hero-controls";
import { HeroStage } from "./hero-stage";

const SWIPE_MIN_PX = 48;

/**
 * Owns the slideshow state for the homepage hero and lays out the hero grid:
 * `intro` (heading, copy, buttons; server-rendered and the same on every slide) beside the stage.
 * No autoplay. Slides change only on Previous/Next, a horizontal swipe (touch or pen), or the
 * Left/Right arrow keys while focus is in the slideshow, with a 400ms crossfade (instant under
 * prefers-reduced-motion, handled in CSS). Render this inside the hero `<section>`; the paper backdrop
 * is positioned against it.
 *
 * Images are loaded lazily: only slide one at first. The first time the visitor hovers, touches,
 * focuses or moves, the neighbouring slides' images are mounted (and each slide visited after that).
 */
export function HeroCarousel({ posters, intro }: { posters: HeroStagePoster[]; intro: ReactNode }) {
  const count = posters.length;
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const warm = useCallback(
    (around: number) => {
      setMounted((prev) => {
        const next = new Set(prev);
        for (const i of [around, around + 1, around - 1]) next.add(((i % count) + count) % count);
        return next.size === prev.size ? prev : next;
      });
    },
    [count],
  );

  const go = useCallback(
    (delta: number) => {
      const target = (((index + delta) % count) + count) % count;
      setIndex(target);
      warm(target);
    },
    [count, index, warm],
  );

  const interactive = count > 1;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!interactive || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    warm(index);
    if (!interactive || event.pointerType === "mouse") return;
    swipe.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const from = swipe.current;
    swipe.current = null;
    if (!from) return;
    const dx = event.clientX - from.x;
    const dy = event.clientY - from.y;
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  }

  return (
    <>
      <HeroBackground posters={posters} index={index} mounted={mounted} />
      <div
        className="mx-auto grid max-w-6xl touch-pan-y gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12 lg:px-8 lg:py-10"
        onPointerEnter={() => warm(index)}
        onFocusCapture={() => warm(index)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipe.current = null;
        }}
      >
        {intro}
        {count > 0 ? (
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label="Featured event posters"
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={onKeyDown}
            className="min-w-0 outline-offset-8 focus-visible:outline-2 focus-visible:outline-ink"
          >
            <HeroStage posters={posters} index={index} mounted={mounted} />
            {interactive ? (
              <div className="lg:ml-auto lg:max-w-[20rem]">
                <HeroControls index={index} count={count} onPrev={() => go(-1)} onNext={() => go(1)} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
