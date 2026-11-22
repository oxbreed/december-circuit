"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { editGroupTripAction, joinGroupTripAction, type TripActionResult } from "../trip/actions";
import { TripRowsList } from "./trip-rows";
import { useTripItems, type TripItem } from "./trip-storage";

const joinInitial: TripActionResult = { ok: false };

export function SharedTripClient({
  title,
  items,
  shareToken,
  signedIn,
  canEdit,
  cloudSyncAvailable,
}: {
  title: string;
  items: TripItem[];
  shareToken: string;
  signedIn: boolean;
  canEdit: boolean;
  cloudSyncAvailable: boolean;
}) {
  const [joinState, joinAction, joinPending] = useActionState(joinGroupTripAction, joinInitial);

  const [editState, editAction, editPending] = useActionState(editGroupTripAction, joinInitial);
  const localItems = useTripItems();
  const groupKeys = new Set(items.map((item) => `${item.kind}:${item.id}`));
  const available = localItems.filter((item) => !groupKeys.has(`${item.kind}:${item.id}`));
  function remove(item: TripItem) {
    if (editPending) return;
    const data = new FormData();
    data.set("shareToken", shareToken);
    data.set("intent", "remove");
    data.set("items", JSON.stringify([item]));
    startTransition(() => editAction(data));
  }

  return (
    <>
      <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-lagoon">Shared group trip</p>
      <h1 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">{title}</h1>
      {!cloudSyncAvailable ? (
        <p className="mt-4 text-sm leading-7 text-muted">Cloud trips are not configured on this deployment.</p>
      ) : canEdit ? (
        <p className="mt-4 text-sm leading-7 text-ink">You can edit this group trip as a collaborator.</p>
      ) : (
        <p className="mt-4 text-sm leading-7 text-muted">
          Read-only view. Sign in and join to edit with the group.
        </p>
      )}
      {items.length === 0 ? (
        <p className="mt-6 text-sm leading-7 text-muted">Nothing is saved on this schedule yet.</p>
      ) : (
        <div className="mt-6">
          <TripRowsList items={items} readOnly={!canEdit} onRemove={remove} removePending={editPending} />
        </div>
      )}
      {canEdit && (
        <form action={editAction} className="mt-6 grid justify-items-start gap-3">
          <input type="hidden" name="shareToken" value={shareToken} />
          <input type="hidden" name="intent" value="add" />
          <input type="hidden" name="items" value={JSON.stringify(available)} />
          <button type="submit" disabled={editPending || !available.length} className="min-h-11 bg-ink px-4 py-3 text-sm font-semibold text-chart disabled:opacity-50">
            {editPending ? "Updating…" : "Add your browser saves"}
          </button>
          {editState.message && <p role={editState.ok ? "status" : "alert"} className="text-sm">{editState.message}</p>}
        </form>
      )}
      {cloudSyncAvailable && !canEdit ? (
        <div className="mt-8 border border-ink/15 bg-chart p-4">
          {signedIn ? (
            <form action={joinAction}>
              <input type="hidden" name="shareToken" value={shareToken} />
              <button
                type="submit"
                disabled={joinPending}
                className="inline-flex bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
              >
                Join as collaborator
              </button>
              {joinState.ok ? (
                <p className="mt-3 text-sm leading-6 text-ink">You joined this group trip.</p>
              ) : null}
              {joinState.message ? (
                <p className="mt-3 text-sm leading-6 text-oxide">{joinState.message}</p>
              ) : null}
            </form>
          ) : (
            <p className="text-sm leading-7 text-muted">
              <Link href="/sign-in" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                Sign in
              </Link>{" "}
              to join and edit this schedule with friends.
            </p>
          )}
        </div>
      ) : null}
      <Link
        href="/#trip"
        className="mt-8 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
      >
        My trip on this device
      </Link>
    </>
  );
}