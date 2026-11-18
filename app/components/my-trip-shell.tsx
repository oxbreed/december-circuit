import { Suspense } from "react";
import Link from "next/link";
import { tripCloudSync } from "../trip-cloud";
import { getDirectoryUser } from "../supabase/session";
import { LagosClockSlot } from "./lagos-clock-slot";
import { MyTripList } from "./my-trip";
import { TripAccountPanel } from "./trip-account-panel";

function MyTripShellFrame({
  signedIn,
  cloudSyncAvailable,
}: {
  signedIn: boolean;
  cloudSyncAvailable: boolean;
}) {
  return (
    <section id="trip" className="scroll-mt-36 border-b border-ink/10 bg-chart">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <article className="border border-ink/15 bg-paper shadow-[4px_4px_0_0_rgba(138,98,50,0.16)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(17.5rem,23rem)]">
            <div className="min-w-0 px-5 py-6 sm:px-7 sm:py-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Trip planner</p>
              <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
                Plan your trip
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink">
                Guest trip planning works in this browser.
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                <Link
                  href="/sign-in"
                  className="underline decoration-ink/25 underline-offset-4 hover:text-ink"
                >
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
        <TripAccountPanel signedIn={signedIn} cloudSyncAvailable={cloudSyncAvailable} />
      </div>
    </section>
  );
}

async function MyTripShellSession() {
  const user = await getDirectoryUser();
  const cloud = tripCloudSync();

  return (
    <MyTripShellFrame signedIn={Boolean(user)} cloudSyncAvailable={cloud.connected} />
  );
}

export function MyTripShell() {
  const cloud = tripCloudSync();

  return (
    <Suspense
      fallback={
        <MyTripShellFrame signedIn={false} cloudSyncAvailable={cloud.connected} />
      }
    >
      <MyTripShellSession />
    </Suspense>
  );
}