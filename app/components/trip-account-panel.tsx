"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  fetchCloudPersonalTrip,
  pushCloudPersonalTrip,
  startGroupTrip,
  type TripActionResult,
} from "../trip/actions";
import { readTripItems, replaceTripItems, useTripItems } from "./trip-storage";

const initial: TripActionResult = { ok: false };
const button = "inline-flex min-h-11 items-center bg-ink px-4 py-3 text-sm font-semibold text-chart disabled:opacity-60";

function ShareField({ token }: { token: string }) {
  const [copyNote, setCopyNote] = useState("");
  const path = `/trip/share/${token}`;
  const href = `https://www.dirtydecember.info${path}`;

  return (
    <div className="mt-4 grid gap-3 border border-ink/15 bg-paper p-4">
      <p className="text-sm font-semibold">Group trip created</p>
      <p className="text-sm text-muted">Anyone with the link can view the trip. Signed-in guests can join and edit it.</p>
      <input aria-label="Group trip invitation link" readOnly value={href} className="ledger-input text-sm" onFocus={(event) => event.target.select()} />
      <div className="flex flex-wrap items-center gap-3">
        <Link href={path} className={button}>Open group trip</Link>
        <button type="button" className="min-h-11 px-3 text-sm font-semibold underline underline-offset-4" onClick={async () => {
          try {
            await navigator.clipboard.writeText(href);
            setCopyNote("Invitation copied.");
          } catch {
            setCopyNote("Select and copy the invitation link above.");
          }
        }}>Copy invitation</button>
      </div>
      {copyNote && <p role="status" className="text-sm">{copyNote}</p>}
    </div>
  );
}

export function TripAccountPanel({ signedIn, cloudSyncAvailable }: {
  signedIn: boolean;
  cloudSyncAvailable: boolean;
}) {
  const localItems = useTripItems();
  const [load, setLoad] = useState<"loading" | "ready" | "failed">("loading");
  const [attempt, setAttempt] = useState(0);
  const [groups, setGroups] = useState<Awaited<ReturnType<typeof fetchCloudPersonalTrip>>["groups"]>([]);
  const [group, create, creating] = useActionState(startGroupTrip, initial);
  const [save, sync, saving] = useActionState(pushCloudPersonalTrip, initial);

  useEffect(() => {
    if (!signedIn || !cloudSyncAvailable) return;
    let active = true;
    fetchCloudPersonalTrip().then(({ items, groups }) => {
      if (!active) return;
      if (!items) {
        setLoad("failed");
        return;
      }
      const current = readTripItems();
      const seen = new Set(current.map((item) => `${item.kind}:${item.id}`));
      const missing = items.filter((item) => !seen.has(`${item.kind}:${item.id}`));
      if (missing.length) replaceTripItems([...current, ...missing]);
      setGroups(groups);
      setLoad("ready");
    }).catch(() => {
      if (active) setLoad("failed");
    });
    return () => { active = false; };
  }, [signedIn, cloudSyncAvailable, attempt]);

  if (!cloudSyncAvailable) return <p className="mt-6 text-sm text-muted">Account sync is unavailable. Your trip is saved in this browser.</p>;
  if (!signedIn) return null;

  const unavailable = load !== "ready";
  return (
    <section aria-labelledby="trip-account-heading" className="mt-8 border border-ink/15 bg-paper p-3 sm:p-6">
      <h3 id="trip-account-heading" className="font-display text-3xl">Trip account</h3>
      {load === "loading" && <p role="status" className="mt-3 text-sm text-muted">Loading your account trip…</p>}
      {load === "failed" && (
        <div className="mt-3 text-sm">
          <p role="alert">Your account trip could not load. Your browser saves are still here.</p>
          <button type="button" className="min-h-11 underline underline-offset-4" onClick={() => {
            setLoad("loading");
            setAttempt((value) => value + 1);
          }}>Try again</button>
        </div>
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <form action={sync} className="grid min-w-0 content-start gap-3 border border-ink/15 bg-chart p-4">
          <h4 className="font-semibold">Personal trip</h4>
          <p className="text-sm text-muted">Save your current list to use it on other devices.</p>
          <input type="hidden" name="items" value={JSON.stringify(localItems)} />
          <button type="submit" disabled={unavailable || saving} className={`${button} justify-center sm:w-fit`}>
            {saving ? "Saving…" : "Save to account"}
          </button>
          {save.message && <p role={save.ok ? "status" : "alert"} className="text-sm">{save.message}</p>}
        </form>
        <form action={create} className="grid min-w-0 content-start gap-3 border border-ink/15 bg-chart p-4">
          <h4 className="font-semibold">Group trip</h4>
          <p className="text-sm text-muted">Start with a copy of this list and share it with friends.</p>
          <input type="hidden" name="items" value={JSON.stringify(localItems)} />
          <label className="grid gap-1 text-sm font-medium">
            Group trip name
            <input name="title" required maxLength={120} placeholder="Lagos crew" className="ledger-input min-w-0 w-full" />
          </label>
          <button type="submit" disabled={unavailable || creating} className={`${button} justify-center sm:w-fit`}>
            {creating ? "Creating…" : "Start group trip"}
          </button>
          {!group.ok && group.message && <p role="alert" className="text-sm">{group.message}</p>}
        </form>
      </div>
      {group.shareToken && <ShareField key={group.shareToken} token={group.shareToken} />}
      {groups.length > 0 && (
        <div className="mt-5">
          <h4 className="font-semibold">Your group trips</h4>
          <ul className="mt-2 grid gap-2">
            {groups.map((trip) => (
              <li key={trip.share_token}><Link href={`/trip/share/${trip.share_token}`} className="text-sm underline underline-offset-4">{trip.title}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
