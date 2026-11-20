"use client";

import Image from "next/image";
import Link from "next/link";
import type { HomeFeature } from "../home-featured";
import { DateBlock } from "./event-card";
import { LoadMoreList } from "./load-more";
import { SaveTripButton } from "./save-trip-button";

/** The whole poster, over a blurred copy of itself so portrait and wide posters share one frame. */
function PosterFrame({ feature, priority }: { feature: HomeFeature; priority: boolean }) {
  const sizes = "(max-width: 639px) 40vw, (max-width: 1023px) 50vw, 20vw";
  return (
    <div className="relative aspect-[4/5] w-32 shrink-0 overflow-hidden border-r border-ink/10 bg-ink sm:w-full sm:border-b sm:border-r-0">
      <Image src={feature.poster.src} alt="" fill sizes={sizes} priority={priority} className="scale-110 object-cover opacity-45 blur-xl" />
      <Image src={feature.poster.src} alt={feature.poster.alt} fill sizes={sizes} priority={priority} className="object-contain" />
    </div>
  );
}

function FeaturedCard({ feature, index }: { feature: HomeFeature; index: number }) {
  return (
    <article className="flex min-w-0 flex-row border border-ink/15 bg-chart sm:flex-col">
      <Link href={feature.href} className="block shrink-0" tabIndex={-1} aria-hidden="true">
        <PosterFrame feature={feature} priority={index < 2} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        <DateBlock when={feature.date} />
        <div className="min-w-0">
          <h3 className="font-display text-2xl leading-none tracking-tight">
            <Link href={feature.href} className="hover:text-oxide">
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
    </article>
  );
}

export function FeaturedSeasonGrid({ featured }: { featured: HomeFeature[] }) {
  return (
    <LoadMoreList items={featured} mobileSize={4} desktopSize={10} noun="featured events">
      {(visible) => (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {visible.map((feature, index) => (
            <FeaturedCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      )}
    </LoadMoreList>
  );
}
