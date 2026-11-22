"use client";

import { useActionState } from "react";
import { saveListingRating } from "../listing-rating-actions";

export function ListingRatingForm({
  kind, slug, score,
}: { kind: "event" | "place"; slug: string; score?: number }) {
  const [state, submit, pending] = useActionState(saveListingRating.bind(null, kind, slug), {
    ok: false,
    message: "",
  });

  return (
    <form action={submit} className="mt-4 grid max-w-sm gap-3">
      <fieldset disabled={pending}>
        <legend className="mb-2 text-sm font-semibold">{score ? "Update your rating" : "Your rating"}</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="flex min-h-11 items-center gap-1 border border-ink/20 px-2 text-sm">
              <input required type="radio" name="score" value={value} defaultChecked={score === value} />
              <span aria-label={`${value} out of 5 stars`}>{value} ★</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button disabled={pending} className="w-fit bg-ink px-4 py-3 text-sm text-chart disabled:opacity-60">
        {pending ? "Saving…" : "Save rating"}
      </button>
      <p role={state.ok ? "status" : "alert"} className="text-sm">{state.message}</p>
    </form>
  );
}
