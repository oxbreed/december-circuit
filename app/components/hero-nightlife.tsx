"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import {
  heroNightLicense,
  heroNightLicenseUrl,
  heroNightSlides,
  type HeroSlide,
} from "../hero-nightlife";

const controlClass =
  "inline-flex items-center justify-center min-h-11 rounded-sm border border-ink/20 bg-chart px-3 text-xs font-medium text-ink hover:border-oxide hover:text-oxide";

function leaveSite(href: string, label: string) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/25 underline-offset-2 hover:text-oxide">
      {label}
      <span className="sr-only"> (leaves this site)</span>
    </a>
  );
}

function isNear(itemIndex: number, index: number, count: number) {
  // Render the current slide and its neighbours only, so a long carousel does not
  // fetch every poster on first load.
  return (
    itemIndex === index ||
    itemIndex === (index + 1) % count ||
    itemIndex === (index - 1 + count) % count
  );
}

function SlideImage({ item, active, first }: { item: HeroSlide; active: boolean; first: boolean }) {
  const state = active ? "z-10 opacity-100" : "z-0 opacity-0";
  if (item.kind === "poster") {
    return (
      <div className={`hero-night-photo absolute inset-0 ${state}`} aria-hidden={active ? undefined : true}>
        <Image
          src={item.src}
          alt=""
          fill
          priority={first}
          sizes="100vw"
          className="scale-110 object-cover opacity-45 blur-2xl"
        />
        <Image
          src={item.src}
          alt={active ? item.alt : ""}
          fill
          priority={first}
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain"
        />
      </div>
    );
  }
  return (
    <Image
      src={item.src}
      alt={active ? item.alt : ""}
      fill
      priority={first}
      sizes="100vw"
      className={`hero-night-photo object-cover ${item.focus} ${state}`}
      aria-hidden={active ? undefined : true}
    />
  );
}

function SlideCredit({ slide }: { slide: HeroSlide }) {
  if (slide.kind === "poster") {
    return (
      <p className="mt-1 text-[11px] leading-4 text-muted">
        <span className="text-ink">{slide.date}</span>
        {" · "}
        {slide.creditUrl ? (
          <>
            {leaveSite(slide.creditUrl, slide.credit ?? "Image source")}.
          </>
        ) : (
          <>{slide.credit ?? "Event poster"}.</>
        )}{" "}
        <Link href={slide.href} className="text-ink underline decoration-ink/30 underline-offset-2 hover:text-oxide">
          Event details
        </Link>
      </p>
    );
  }
  return (
    <p className="mt-1 text-[11px] leading-4 text-muted">
      Photo: {slide.author}, {leaveSite(heroNightLicenseUrl, heroNightLicense)},{" "}
      {leaveSite(slide.sourceUrl, "Wikimedia Commons")}.
    </p>
  );
}

export function HeroNightlife({ slides = heroNightSlides }: { slides?: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const slide = slides[index] ?? slides[0];

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
      className="min-w-0 overflow-hidden rounded-xl border border-ink/15 bg-chart shadow-sm"
      aria-roledescription="carousel"
      aria-label="December event posters and West African nights"
      onKeyDown={onKeyDown}
    >
      <div className="relative h-48 w-full overflow-hidden bg-ink sm:h-64 lg:h-64 xl:h-72">
        {slides.map((item, itemIndex) =>
          isNear(itemIndex, index, count) ? (
            <SlideImage key={itemIndex} item={item} active={itemIndex === index} first={itemIndex === 0} />
          ) : null,
        )}
      </div>
      <figcaption className="border-t border-ink/10 bg-chart" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0 flex-1 basis-48">
            <p className="font-display text-lg leading-tight tracking-tight text-ink sm:text-xl">
              {slide.place}
              <span className="text-lagoon"> · {slide.city}</span>
            </p>
            <SlideCredit slide={slide} />
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
