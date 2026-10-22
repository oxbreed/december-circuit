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
      aria-label="Landmarks in cities on file"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="bg-chart p-1.5 shadow-[8px_8px_0_0_#b8432f] ring-1 ring-ink">
        <div className="ring-1 ring-gold">
          <img
            key={slide.src}
            src={slide.src}
            alt={`${slide.name}, ${slide.city}`}
            className={`h-52 w-full object-cover ${reduceMotion ? "" : "landmark-fade"}`}
          />
        </div>
      </div>
      <figcaption
        aria-live={reduceMotion ? "off" : "polite"}
        className="mt-3 flex items-baseline justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
      >
        <span>{slide.name}</span>
        <span className="shrink-0 text-gold">{slide.city}</span>
      </figcaption>
    </figure>
  );
}
