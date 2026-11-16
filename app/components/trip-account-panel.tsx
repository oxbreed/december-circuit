"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  fetchCloudPersonalTrip,
  pushCloudPersonalTrip,
  startGroupTrip,
  type TripActionResult,
} from "../trip/actions";
import { replaceTripItems, useTripItems } from "./trip-storage";

type TripAccountPanelProps = {
  signedIn: boolean;
  cloudSyncAvailable: boolean;
  userEmail: string | null;
};

const groupInitial: TripActionResult = { ok: false };
const syncInitial: TripActionResult = { ok: false };

function ShareField({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window === "undefined" ? "https://www.dirtydecember.info" : window.location.origin;
  const href = `${origin}/trip/share/${token}`;

  return (
    <div className="mt-4 border border-ink/15 bg-paper p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-lagoon">Group link — read-only until a signed-in friend joins</p>
      <p className="mt-2 break-all font-mono text-sm text-ink">{href}</p>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(href);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
        className="mt-3 inline-flex border border-ink/25 bg-chart px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-ink hover:border-oxide hover:text-oxide"
      >
        {copied ? "Copied" : "Copy share link"}
      </button>
      <p className="mt-3 text-sm leading-6 text-muted">
        Anyone with the link can view the schedule. Collaborators can edit after they{" "}
        <Link href="/sign-in" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          sign in
        </Link>{" "}
        and join from that page.
      </p>
    </div>
  );
}

export function TripAccountPanel({ signedIn, cloudSyncAvailable, userEmail }: TripAccountPanelProps) {
  const localItems = useTripItems();
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [groupToken, setGroupToken] = useState<string | null>(null);
  const pulled = useRef(false);
  const [, startTransition] = useTransition();
  const [groupState, groupAction, groupPending] = useActionState(startGroupTrip, groupInitial);
  const [pushState, pushAction, pushPending] = useActionState(pushCloudPersonalTrip, syncInitial);

  useEffect(() => {
    if (!signedIn || !cloudSyncAvailable || pulled.current) return;
    pulled.current = true;
    startTransition(async () => {
      const cloud = await fetchCloudPersonalTrip();
      if (cloud === null) return;
      if (cloud.length === 0 && localItems.length > 0) {
        setSyncNote("This browser has saved items that are not in your account yet. Use Save to account below.");
        return;
      }
      if (cloud.length > 0) {
        replaceTripItems(cloud);
        setSyncNote("Loaded your account trip into this browser.");
      }
    });
  }, [signedIn, cloudSyncAvailable, localItems.length]);

  useEffect(() => {
    if (groupState.ok && groupState.shareToken) {
      setGroupToken(groupState.shareToken);
    }
  }, [groupState]);

  useEffect(() => {
    if (pushState.ok) {
      setSyncNote("Saved to your account. It can follow you on other devices when cloud sync is on.");
    } else if (pushState.message) {
      setSyncNote(pushState.message);
    }
  }, [pushState]);

  return (
    <div className="mt-8 max-w-2xl border border-ink/15 bg-paper p-4 sm:p-5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-lagoon">Account &amp; sync</p>
      {!cloudSyncAvailable ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          Cloud sync is off on this deployment. This list stays in this browser only until a database URL and
          Supabase sign-in are configured.
        </p>
      ) : signedIn ? (
        <p className="mt-3 text-sm leading-7 text-ink">
          Signed in as {userEmail}. Saves from this browser can sync to your account.
        </p>
      ) : (
        <p className="mt-3 text-sm leading-7 text-muted">
          <Link href="/sign-in" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            Sign in
          </Link>{" "}
          to sync this trip across devices and start a group plan.
        </p>
      )}
      {syncNote ? <p className="mt-3 text-sm leading-6 text-ink">{syncNote}</p> : null}
      {signedIn && cloudSyncAvailable ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <form action={pushAction}>
            <input type="hidden" name="items" value={JSON.stringify(localItems)} />
            <button
              type="submit"
              disabled={pushPending}
              className="inline-flex bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
            >
              Save to account
            </button>
          </form>
          <form action={groupAction} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Group trip name</span>
              <input
                name="title"
                type="text"
                placeholder="Lagos crew"
                className="ledger-input py-2!"
                maxLength={120}
              />
            </label>
            <button
              type="submit"
              disabled={groupPending}
              className="inline-flex shrink-0 border border-ink/25 bg-chart px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-ink hover:border-oxide hover:text-oxide disabled:opacity-60"
            >
              Start group trip
            </button>
          </form>
        </div>
      ) : null}
      {groupState.ok === false && groupState.message ? (
        <p className="mt-3 text-sm leading-6 text-oxide">{groupState.message}</p>
      ) : null}
      {groupToken ? <ShareField token={groupToken} /> : null}
    </div>
  );
}