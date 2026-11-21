import Image from "next/image";
import Link from "next/link";
import { heroNightLicense, heroNightLicenseUrl, type HeroSlide } from "../hero-nightlife";

function leaveSite(href: string, label: string) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/25 underline-offset-2 hover:text-oxide">
      {label}
      <span className="sr-only"> (leaves this site)</span>
    </a>
  );
}

export function HeroSlideImage({ slide, first = false }: { slide: HeroSlide; first?: boolean }) {
  return (
    <Image
      src={slide.src}
      alt={slide.alt}
      fill
      preload={first}
      loading={first ? undefined : "eager"}
      sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 3rem), (max-width: 1151px) calc(50vw - 3.5rem), 520px"
      className={slide.kind === "poster" ? "object-contain" : `object-cover ${slide.focus}`}
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

export function HeroSlideCaption({ slide }: { slide: HeroSlide }) {
  return (
    <>
      <p className="font-display text-lg leading-tight tracking-tight text-ink sm:text-xl">
        {slide.place}
        <span className="text-lagoon"> · {slide.city}</span>
      </p>
      <SlideCredit slide={slide} />
    </>
  );
}
