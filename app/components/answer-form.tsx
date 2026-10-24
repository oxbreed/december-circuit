"use client";

import { useActionState } from "react";
import { submitAnswer, type QuestionState } from "../review-actions";

const initial: QuestionState = { status: "idle" };

export function AnswerForm({
  questionId,
  subjectKind,
  subjectKey,
}: {
  questionId: string;
  subjectKind: "event" | "place";
  subjectKey: string;
}) {
  const [state, action, pending] = useActionState(submitAnswer, initial);

  return (
    <form action={action} className="mt-3 grid max-w-xl gap-2">
      <input type="hidden" name="question_id" value={questionId} />
      <input type="hidden" name="subject_kind" value={subjectKind} />
      <input type="hidden" name="subject_key" value={subjectKey} />
      <label className="block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Answer</span>
        <textarea name="body" required maxLength={2000} rows={3} className="ledger-input py-2!" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex max-w-full border border-ink/20 bg-paper px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-ink disabled:opacity-60"
      >
        Submit an unpublished answer
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
