import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { events } from "../events";
import { heroNightLicense, heroNightSlides } from "../hero-nightlife";
import { landmarks } from "../landmarks";
import { visitorCategoryEntries, type VisitorCategoryEntry } from "../visitor-categories";
import { HomeCategoryStrip } from "./home-category-strip";

const pillarLink =
  "flex h-full flex-col overflow-hidden border border-ink/15 bg-chart hover:border-oxide/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxide";

type HubPhoto = {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
};

/** Only photos that already carry a recorded credit and source URL. */
function landmarkPhoto(src: string): HubPhoto | null {
  const frame = landmarks.find((item) => item.src === src);
  if (!frame?.credit || !frame.creditUrl) return null;
  return {
    src: frame.src,
    alt: `${frame.name}, ${frame.city}`,
    credit: frame.credit,
    creditUrl: frame.creditUrl,
  };
}

function heroPhoto(src: string): HubPhoto | null {
  const slide = heroNightSlides.find((item) => item.src === src);
  if (!slide?.sourceUrl || !slide.author) return null;
  return {
    src: slide.src,
    alt: slide.alt,
    credit: `Photo: ${slide.author}, ${heroNightLicense}, Wikimedia Commons`,
    creditUrl: slide.sourceUrl,
  };
}

function Mark({ className, children }: { className: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.75">
      {children}
    </svg>
  );
}

function EventsMark({ className }: { className: string }) {
  return (
    <Mark className={className}>
      <rect x="5" y="7" width="22" height="20" />
      <path d="M5 13h22M11 4.5v5M21 4.5v5M11 19h4M17 19h4M11 23h4" />
    </Mark>
  );
}

function PlacesMark({ className }: { className: string }) {
  return (
    <Mark className={className}>
      <path d="M16 28s8-7.4 8-14a8 8 0 1 0-16 0c0 6.6 8 14 8 14z" />
      <circle cx="16" cy="14" r="2.4" fill="currentColor" stroke="none" />
    </Mark>
  );
}

function GuidesMark({ className }: { className: string }) {
  return (
    <Mark className={className}>
      <path d="M6 7.5h8.5A3.5 3.5 0 0 1 18 11v14H9.5A3.5 3.5 0 0 0 6 28.5V7.5z" />
      <path d="M26 7.5h-8.5A3.5 3.5 0 0 0 14 11v14h8.5A3.5 3.5 0 0 1 26 28.5V7.5z" />
    </Mark>
  );
}

function VisaMark({ className }: { className: string }) {
  return (
    <Mark className={className}>
      <rect x="7" y="4" width="18" height="24" />
      <path d="M11 11h10M11 16h10M11 21h6" />
    </Mark>
  );
}

const marks = {
  events: EventsMark,
  places: PlacesMark,
  guides: GuidesMark,
  visa: VisaMark,
} as const;

const pillars = [
  {
    href: "/events",
    kicker: "Confirmed",
    title: "Events",
    blurb: "Dated festivals and nights on file — tickets leave this site.",
    tone: "bg-oxide text-chart",
    mark: "events",
    photo: landmarkPhoto("/landmarks/cape-coast-fetu.jpg"),
  },
  {
    href: "/places",
    kicker: "Directory",
    title: "Places",
    blurb: "Hotels, restaurants, clubs, and organiser pages already sourced.",
    tone: "bg-lagoon text-chart",
    mark: "places",
    photo: landmarkPhoto("/landmarks/accra-bloombar.jpg"),
  },
  {
    href: "/guides",
    kicker: "Season",
    title: "Guides",
    blurb: "Lagos, Accra, Calabar, and Carnival guides with outbound links.",
    tone: "bg-brass text-chart",
    mark: "guides",
    photo: heroPhoto("/hero/osu-accra-night.jpg"),
  },
  {
    href: "/visa",
    kicker: "Official",
    title: "Visa",
    blurb: "Government visa notes checked against public pages — not legal advice.",
    tone: "bg-ink text-chart",
    mark: "visa",
    photo: null,
  },
] as const;

const homePlaceCategories = new Set(["Hotels", "Restaurants", "Clubs", "Short-stay"]);

function placeCategoryPicks(): VisitorCategoryEntry[] {
  return visitorCategoryEntries().filter((row) => homePlaceCategories.has(row.category));
}

export function HomeStartNav() {
  const eventTotal = events.length;
  const categories = placeCategoryPicks();

  return (
    <section
      id="start-here"
      aria-labelledby="home-start-heading"
      className="scroll-mt-36 border-b border-ink/10 bg-paper-deep/40"
    >
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <h2 id="home-start-heading" className="sr-only">
          Where to go on dirtydecember.info
        </h2>
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Start here</p>
        <p className="mt-2 max-w-2xl font-display text-2xl leading-tight tracking-tight text-ink md:text-3xl">
          Events, places, guides, and visa — in under a minute
        </p>
        <nav aria-label="Main destinations" className="mt-6">
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {pillars.map((item) => {
              const Icon = marks[item.mark];
              const blurb =
                item.href === "/events" && eventTotal > 0
                  ? `${eventTotal} confirmed ${eventTotal === 1 ? "event" : "events"} on file. Tickets leave this site.`
                  : item.blurb;
              return (
                <li key={item.href} className="flex min-w-0 flex-col">
                  <Link href={item.href} className={pillarLink}>
                    {item.photo ? (
                      <span className="relative block h-24 sm:h-28">
                        <Image
                          src={item.photo.src}
                          alt={item.photo.alt}
                          fill
                          sizes="(max-width: 1024px) 50vw, 240px"
                          className="object-cover"
                        />
                        <span className={`absolute top-2 left-2 flex h-8 w-8 items-center justify-center ${item.tone}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                      </span>
                    ) : (
                      <span className={`flex h-24 items-center justify-center sm:h-28 ${item.tone}`}>
                        <Icon className="h-9 w-9" />
                      </span>
                    )}
                    <span className="flex flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-lagoon">{item.kicker}</span>
                      <span className="mt-1 font-display text-2xl leading-none tracking-tight">{item.title}</span>
                      <span className="mt-2 flex-1 text-xs leading-5 text-muted sm:text-sm sm:leading-6">{blurb}</span>
                      <span className="mt-3 text-[11px] uppercase tracking-[0.16em] text-oxide">Open →</span>
                    </span>
                  </Link>
                  {item.photo ? (
                    <a
                      href={item.photo.creditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-muted underline decoration-ink/20 underline-offset-2 hover:text-oxide"
                    >
                      {item.photo.credit}
                      <span className="sr-only"> — leaves this site</span>
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-lagoon">Places by type</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Hotels, restaurants, clubs, and short-stay hubs — counts from sourced rows only.
              </p>
            </div>
            <Link
              href="/places"
              className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide"
            >
              All places →
            </Link>
          </div>
          <HomeCategoryStrip entries={categories} />
        </div>
        <p className="mt-6 text-sm leading-6 text-muted">
          Interactive trip tools:{" "}
          <Link href="/guide" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Tourist guide
          </Link>
          {" · "}
          <Link href="/flights" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Flight searches
          </Link>
          {" · "}
          <Link href="/map" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Map
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
