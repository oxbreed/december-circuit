import { Suspense } from "react";
import Link from "next/link";
import { tripCloudSync } from "../trip-cloud";
import { getDirectoryUser } from "../supabase/session";
import { HomeSection, homeCard } from "./home-section";
import { LagosClockSlot } from "./lagos-clock-slot";
import { MyTripList } from "./my-trip";
import { TripAccountPanel } from "./trip-account-panel";

async function MyTripAccount() {
  const cloud = tripCloudSync();
  const user = cloud.connected ? await getDirectoryUser() : null;
  return <TripAccountPanel signedIn={Boolean(user)} cloudSyncAvailable={cloud.connected} />;
}

export function MyTripShell() {
  return (
    <HomeSection id="trip" number="05" kicker="Trip planner" title="Plan your trip">
      <article className={homeCard}>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(17.5rem,23rem)]">
          <div className="min-w-0 px-5 py-6 sm:px-7 sm:py-8">
            <p className="max-w-xl text-base leading-7 text-ink">Guest trip planning works in this browser.</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              <Link href="/sign-in" className="underline decoration-ink/25 underline-offset-4 hover:text-ink">
                Sign in
              </Link>
            </p>
          </div>
          <div className="min-w-0 border-t border-brass/40 bg-paper-deep/80 px-5 py-5 sm:px-6 sm:py-6 lg:border-t-0 lg:border-l">
            <LagosClockSlot />
          </div>
        </div>
      </article>
      <MyTripList />
      <Suspense fallback={null}>
        <MyTripAccount />
      </Suspense>
    </HomeSection>
  );
}
