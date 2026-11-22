import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { events } from "../events";
import { homeCard, HomeSection } from "./home-section";

const cardLink =
  `motion-lift flex h-full flex-col overflow-hidden ${homeCard} hover:border-oxide/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxide`;

type HubPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
  /** Commons file page. Omitted when the photo was supplied for this site. */
  creditUrl?: string;
};

/**
 * Homepage directory tiles. Sources are compressed 16:10 WebP derivatives in
 * /public/hubs (*-card.webp). The original photographs remain in that folder.
 * Places and Guides are Wikimedia Commons photographs under CC BY-SA 4.0.
 * Events and Visa are photos supplied for this site.
 */
const hubPhotos = {
  events: {
    src: "/hubs/carnival-parade-card.webp",
    alt: "Carnival parade with costumed figures and bunting",
    width: 717,
    height: 448,
    credit: "Photo supplied for this site",
  },
  places: {
    src: "/hubs/la-campagne-tropicana-card.webp",
    alt: "Play area at La Campagne Tropicana Beach Resort, Ibeju-Lekki",
    width: 1600,
    height: 1000,
    credit: "Photo: Isaacayodele32, CC BY-SA 4.0, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:La_Campagne_Tropicana_Beach_Resort.jpg",
  },
  guides: {
    src: "/hubs/ikoyi-lagos-aerial-card.webp",
    alt: "Ikoyi, Lagos, with Victoria Island beyond the lagoon",
    width: 1600,
    height: 1000,
    credit: "Photo: Reginald Bassey, CC BY-SA 4.0, Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Ikoyi,_Lagos,_Nigeria.jpg",
  },
  visa: {
    src: "/hubs/visa-document-card.webp",
    alt: "Close-up of a visa document",
    width: 1600,
    height: 1000,
    credit: "Photo supplied for this site",
  },
} as const satisfies Record<string, HubPhoto>;

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
    photo: hubPhotos.events,
  },
  {
    href: "/places",
    kicker: "Directory",
    title: "Places",
    blurb: "Hotels, restaurants, clubs, and short stays already sourced.",
    tone: "bg-lagoon text-chart",
    mark: "places",
    photo: hubPhotos.places,
  },
  {
    href: "/guides",
    kicker: "Season",
    title: "Guides",
    blurb: "Lagos, Accra, Calabar, and Carnival guides with outbound links.",
    tone: "bg-brass text-chart",
    mark: "guides",
    photo: hubPhotos.guides,
  },
  {
    href: "/visa",
    kicker: "Official",
    title: "Visa",
    blurb: "Government visa notes checked against public pages — not legal advice.",
    tone: "bg-ink text-chart",
    mark: "visa",
    photo: hubPhotos.visa,
  },
] as const;

export function HomeDirectory() {
  const eventTotal = events.length;

  return (
    <HomeSection
      id="start-here"
      number="01"
      kicker="Start here"
      title="The directory"
      titleId="home-directory-heading"
      lede="Events, places, season guides, and visa — start with the section you need."
    >
      <nav aria-label="Main destinations">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {pillars.map((item) => {
            const Icon = marks[item.mark];
            const blurb =
              item.href === "/events" && eventTotal > 0
                ? `${eventTotal} confirmed ${eventTotal === 1 ? "event" : "events"} on file. Tickets leave this site.`
                : item.blurb;
            return (
              <li key={item.href} className="flex min-w-0 flex-col">
                <Link href={item.href} className={cardLink}>
                  <span className="relative block aspect-[16/10] overflow-hidden bg-ink">
                    <Image
                      src={item.photo.src}
                      alt={item.photo.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 280px"
                      className="motion-zoom object-cover object-center"
                    />
                    <span className={`absolute top-2 left-2 flex h-8 w-8 items-center justify-center ${item.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-oxide">{item.kicker}</span>
                    <span className="mt-1.5 font-display text-2xl leading-none tracking-tight sm:text-3xl">{item.title}</span>
                    <span className="mt-2 flex-1 text-xs leading-5 text-muted sm:text-sm sm:leading-6">{blurb}</span>
                    <span className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-oxide">Open →</span>
                  </span>
                </Link>
                {"creditUrl" in item.photo && item.photo.creditUrl ? (
                  <a
                    href={item.photo.creditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-muted underline decoration-ink/20 underline-offset-2 hover:text-oxide"
                  >
                    {item.photo.credit}
                    <span className="sr-only"> — leaves this site</span>
                  </a>
                ) : (
                  <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-muted">{item.photo.credit}</p>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </HomeSection>
  );
}
