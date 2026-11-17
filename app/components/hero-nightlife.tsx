"use client";

import Image from "next/image";
import { useEffect, useState, type KeyboardEvent } from "react";
import {
  heroNightLicense,
  heroNightLicenseUrl,
  heroNightSlides,
  type HeroNightSlide,
} from "../hero-nightlife";

const INTERVAL_MS = 8000;

const controlClass =
  "inline-flex items-center justify-center border border-ink/20 bg-chart px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-ink hover:border-oxide hover:text-oxide";

function leaveSite(href: string, label: string) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/25 underline-offset-2 hover:text-oxide">
      {label}
      <span className="sr-only"> (leaves this site)</span>
    </a>
  );
}

export function HeroNightlife({ slides = heroNightSlides }: { slides?: HeroNightSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const count = slides.length;
  const slide = slides[index] ?? slides[0];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    setMotionReady(true);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!motionReady || reduceMotion || paused || count < 2) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [motionReady, reduceMotion, paused, index, count]);

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

  if (!slide) return null;

  return (
    <figure
      aria-roledescription="carousel"
      aria-label="Lagos and Accra at night"
      onKeyDown={onKeyDown}
    >
      <div className="relative h-36 w-full overflow-hidden bg-ink sm:h-48 lg:h-64 xl:h-72">
        {slides.map((item, itemIndex) => {
          const active = itemIndex === index;
          return (
            <Image
              key={item.src}
              src={item.src}
              alt={active ? item.alt : ""}
              fill
              priority={itemIndex === 0}
              sizes="100vw"
              className={`hero-night-photo object-cover ${item.focus} ${active ? "z-10 opacity-100" : "z-0 opacity-0"}`}
              aria-hidden={active ? undefined : true}
            />
          );
        })}
      </div>
      <figcaption className="border-b border-ink/10 bg-chart" aria-live="polite">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-6 lg:px-8 lg:py-2.5">
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight tracking-tight text-ink sm:text-xl">
              {slide.place}
              <span className="text-lagoon"> · {slide.city}</span>
            </p>
            <p className="mt-1 text-[11px] leading-4 text-muted">
              Photo: {slide.author}, {leaveSite(heroNightLicenseUrl, heroNightLicense)},{" "}
              {leaveSite(slide.sourceUrl, "Wikimedia Commons")}. Both links leave this site.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2" role="group" aria-label="Night photo controls">
            <button type="button" className={controlClass} onClick={() => go(-1)}>
              Previous
            </button>
            {reduceMotion ? (
              <span className="px-1 text-[10px] uppercase tracking-[0.16em] text-muted">Still</span>
            ) : (
              <button
                type="button"
                className={controlClass}
                aria-pressed={paused}
                onClick={() => setPaused((current) => !current)}
              >
                {paused ? "Play" : "Pause"}
              </button>
            )}
            <button type="button" className={controlClass} onClick={() => go(1)}>
              Next
            </button>
            <span className="pl-1 text-[10px] uppercase tracking-[0.16em] text-muted">
              {index + 1} / {count}
            </span>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}
