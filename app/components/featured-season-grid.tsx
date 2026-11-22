"use client";

import Image from "next/image";
import Link from "next/link";
import type { HomeFeature } from "../home-featured";
import { LoadMoreList } from "./load-more";
import { SaveTripButton } from "./save-trip-button";

/** Use one image and keep the full poster visible. */
function PosterFrame({ feature }: { feature: HomeFeature }) {
  const sizes = "(max-width: 374px) 96px, (max-width: 639px) 112px, (max-width: 1023px) 50vw, 20vw";
  return (
    <div className="relative aspect-[4/5] w-24 min-[375px]:w-28 shrink-0 overflow-hidden border-r border-ink/10 bg-ink sm:w-full sm:border-b sm:border-r-0">
      <Image src={feature.poster.src} alt={feature.poster.alt} fill sizes={sizes} className="object-contain" />
    </div>
  );
}

function FeaturedCard({ feature }: { feature: HomeFeature }) {
  return (
    <article className="flex min-w-0 flex-row overflow-hidden border border-ink/15 bg-chart shadow-sm sm:flex-col">
      <Link prefetch={false} href={feature.href} className="block shrink-0" tabIndex={-1} aria-hidden="true">
        <PosterFrame feature={feature} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        <p className="text-xs font-semibold text-oxide">{feature.date}</p>
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight sm:text-2xl sm:leading-none tracking-tight">
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
    </article>
  );
}

export function FeaturedSeasonGrid({ featured }: { featured: HomeFeature[] }) {
  return (
    <LoadMoreList items={featured} mobileSize={3} desktopSize={5} noun="featured events">
      {(visible) => (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {visible.map((feature) => (
            <FeaturedCard key={feature.id} feature={feature} />
          ))}
        </div>
      )}
    </LoadMoreList>
  );
}
