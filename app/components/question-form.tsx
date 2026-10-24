"use client";

import { useActionState } from "react";
import { submitQuestion, type QuestionState } from "../review-actions";

const initial: QuestionState = { status: "idle" };

export function QuestionForm({
  subjectKind,
  subjectKey,
}: {
  subjectKind: "event" | "place";
  subjectKey: string;
}) {
  const [state, action, pending] = useActionState(submitQuestion, initial);

  return (
    <form action={action} className="mt-4 grid max-w-xl gap-2">
      <input type="hidden" name="subject_kind" value={subjectKind} />
      <input type="hidden" name="subject_key" value={subjectKey} />
      <label className="block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Question</span>
        <textarea name="body" required maxLength={1000} rows={3} className="ledger-input py-2!" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex max-w-full bg-ink px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
      >
        Ask a question
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
