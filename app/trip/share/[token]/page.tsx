import { Suspense } from "react";
import { SharedTripClient } from "../../../components/shared-trip-client";
import { pageMetadata } from "../../../site";
import { getDirectoryUser } from "../../../supabase/session";
import { tripCloudSync } from "../../../trip-cloud";
import { canEditSharedList, loadSharedTripByToken } from "../../server";

export const instant = false;

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const trip = await loadSharedTripByToken(token);
  return { ...pageMetadata({
    title: trip ? trip.title : "Shared trip",
    description: trip
      ? `Read-only group schedule on dirtydecember.info — ${trip.items.length} saved items on file.`
      : "Shared trip link on dirtydecember.info.",
    path: "/trip",
    robots: { index: false, follow: false },
  }), referrer: "no-referrer" as const };
}

export default async function SharedTripPage({ params }: PageProps) {
  const { token } = await params;
  const cloud = tripCloudSync();
  const trip = cloud.connected ? await loadSharedTripByToken(token) : null;
  const user = await getDirectoryUser();
  const canEdit = trip ? await canEditSharedList(trip.listId) : false;

  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
      {!trip ? (
        <>
          <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Shared schedule</p>
          <h1 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">
            This link is not on file
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            The share link may have expired or cloud sync is not configured on this deployment.
          </p>
        </>
      ) : (
        <Suspense
          fallback={
            <p className="mt-4 text-sm leading-7 text-muted">Loading shared schedule…</p>
          }
        >
          <SharedTripClient
            title={trip.title}
            items={trip.items}
            shareToken={token}
            signedIn={Boolean(user)}
            canEdit={canEdit}
            cloudSyncAvailable={cloud.connected}
          />
        </Suspense>
      )}
    </main>
  );
}