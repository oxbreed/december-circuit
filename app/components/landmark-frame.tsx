"use client";

import { useEffect, useState } from "react";
import { landmarks } from "../landmarks";

const INTERVAL_MS = 8000;

export function LandmarkFrame() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion || paused || landmarks.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % landmarks.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  const slide = landmarks[index];

  return (
    <figure
      className="min-w-0 max-w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="bg-chart p-1.5 shadow-[8px_8px_0_0_#b8432f] ring-1 ring-ink">
        <div className="ring-1 ring-gold">
          <img
            key={slide.src}
            src={slide.src}
            alt={`${slide.name}, ${slide.city}${slide.credit ? `. ${slide.credit}` : ""}`}
            width={960}
            height={540}
            decoding="async"
            fetchPriority={index === 0 ? "high" : "low"}
            className={`h-16 w-full object-cover lg:h-52 ${reduceMotion ? "" : "landmark-fade"}`}
          />
        </div>
      </div>
      <figcaption aria-live={reduceMotion ? "off" : "polite"} className="mt-1.5 lg:mt-3">
        <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="min-w-0">{slide.name}</span>
          <span className="shrink-0 text-gold">{slide.city}</span>
        </div>
        {slide.credit && slide.creditUrl ? (
          <a
            href={slide.creditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block break-words font-sans text-[10px] leading-4 text-muted underline decoration-ink/20 underline-offset-2 hover:text-oxide"
          >
            {slide.credit}
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}
