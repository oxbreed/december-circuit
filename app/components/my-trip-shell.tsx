import { Suspense } from "react";
import Link from "next/link";
import { tripCloudSync } from "../trip-cloud";
import { getDirectoryUser } from "../supabase/session";
import { homeCard } from "./home-section";
import { LagosClockSlot } from "./lagos-clock-slot";
import { MyTripList } from "./my-trip";
import { TripAccountPanel } from "./trip-account-panel";

async function MyTripAccount() {
  const cloud = tripCloudSync();
  const user = cloud.connected ? await getDirectoryUser() : null;
  return <TripAccountPanel signedIn={Boolean(user)} cloudSyncAvailable={cloud.connected} />;
}

/** The visitor's saved trip, Lagos clock and sign-in, for the merged Plan your trip section. */
export function MyTripShell() {
  return (
    <div className="min-w-0">
      <h3 className="font-display text-2xl leading-none tracking-tight">Your saved trip</h3>
      <article className={`mt-4 ${homeCard}`}>
        <div className="min-w-0 px-5 py-5">
          <p className="text-base leading-7 text-ink">Guest trip planning works in this browser.</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            <Link href="/sign-in" className="underline decoration-ink/25 underline-offset-4 hover:text-ink">
              Sign in
            </Link>{" "}
            to keep it across devices.
          </p>
        </div>
        <div className="min-w-0 border-t border-brass/40 bg-paper-deep/80 px-5 py-5">
          <LagosClockSlot />
        </div>
      </article>
      <MyTripList />
    </div>
  );
}

/** Account and sync panel, shown full width under the two columns. */
export function MyTripAccountSlot() {
  return (
    <Suspense fallback={null}>
      <MyTripAccount />
    </Suspense>
  );
}
