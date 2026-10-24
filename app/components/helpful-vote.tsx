"use client";

import { useActionState } from "react";
import { markReviewHelpful, type VoteState } from "../review-actions";
import type { UgcSubjectKind } from "../ugc-subject";

const initial: VoteState = { status: "idle" };

export function HelpfulVote({
  reviewId,
  helpfulCount,
  subjectKind,
  subjectKey,
  signedIn,
}: {
  reviewId: string;
  helpfulCount: number;
  subjectKind: UgcSubjectKind;
  subjectKey: string;
  signedIn: boolean;
}) {
  const [state, action, pending] = useActionState(markReviewHelpful, initial);

  if (!signedIn) {
    return (
      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
        {helpfulCount > 0 ? `${helpfulCount} found this helpful` : "Sign in to mark helpful"}
      </p>
    );
  }

  return (
    <form action={action} className="mt-2 flex flex-wrap items-center gap-3">
      <input type="hidden" name="review_id" value={reviewId} />
      <input type="hidden" name="subject_kind" value={subjectKind} />
      <input type="hidden" name="subject_key" value={subjectKey} />
      <button
        type="submit"
        disabled={pending}
        className="text-[11px] uppercase tracking-[0.14em] text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide disabled:opacity-60"
      >
        Helpful
      </button>
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
        {helpfulCount > 0 ? `${helpfulCount} marked` : "No marks yet"}
      </span>
      {state.status === "saved" ? (
        <span className="text-[11px] tracking-[0.08em] text-ink">{state.message}</span>
      ) : null}
      {state.status === "error" ? (
        <span className="text-[11px] tracking-[0.08em] text-oxide">{state.message}</span>
      ) : null}
    </form>
  );
}
