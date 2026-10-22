"use client";

import { useActionState } from "react";
import { submitReview, type ReviewState } from "../review-actions";

const initial: ReviewState = { status: "idle" };

export function ReviewForm() {
  const [state, action, pending] = useActionState(submitReview, initial);

  return (
    <form action={action} className="mt-4 grid max-w-xl gap-2">
      <label className="block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Review</span>
        <textarea name="body" required maxLength={2000} rows={4} className="ledger-input py-2!" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex max-w-full bg-ink px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
      >
        Submit a review
      </button>
      {state.status === "saved" ? (
        <p className="text-sm leading-6 text-ink">{state.message}</p>
      ) : null}
      {state.status === "error" ? (
        <p className="text-sm leading-6 text-oxide">{state.message}</p>
      ) : null}
    </form>
  );
}
