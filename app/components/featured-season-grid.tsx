import Image from "next/image";
import Link from "next/link";
import type { HomeFeature } from "../home-featured";
import { homeCard } from "./home-section";
import { SaveTripButton } from "./save-trip-button";

/** First N cards: a swipe rail on small screens, four across from `lg`. */
const RAIL_COUNT = 7;
const DESKTOP_COUNT = 4;

/** Every poster fills the same 4:5 frame; wide artwork is cropped, not boxed in black. */
function PosterFrame({ feature, index }: { feature: HomeFeature; index: number }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
      <Image
        src={feature.poster.src}
        alt={feature.poster.alt}
        fill
        sizes="(max-width: 639px) 68vw, (max-width: 1023px) 44vw, 25vw"
        loading={index < 2 ? "eager" : "lazy"}
        className="object-cover"
      />
    </div>
  );
}

function FeaturedCard({ feature, index }: { feature: HomeFeature; index: number }) {
  return (
    <li
      className={`flex w-[68%] min-w-0 shrink-0 snap-start flex-col sm:w-[44%] lg:w-auto ${homeCard} ${
        index >= DESKTOP_COUNT ? "lg:hidden" : ""
      }`}
    >
      <Link prefetch={false} href={feature.href} className="block" tabIndex={-1} aria-hidden="true">
        <PosterFrame feature={feature} index={index} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-oxide">{feature.date}</p>
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight tracking-tight sm:text-2xl sm:leading-none">
            <Link prefetch={false} href={feature.href} className="hover:text-oxide">
              {feature.artist}
            </Link>
          </h3>
          <p className="mt-2 text-sm leading-5 text-ink">{feature.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">{feature.region}</p>
        </div>
        <div className="mt-auto pt-1">
          <SaveTripButton kind="event" id={feature.tripId} />
        </div>
      </div>
    </li>
  );
}

export function FeaturedSeasonGrid({ featured }: { featured: HomeFeature[] }) {
  return (
    <ul
      aria-label="Featured events"
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {featured.slice(0, RAIL_COUNT).map((feature, index) => (
        <FeaturedCard key={feature.id} feature={feature} index={index} />
      ))}
    </ul>
  );
}
