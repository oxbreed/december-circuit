"use client";

import { useActionState } from "react";
import { sendSignInLink, type SignInState } from "../auth/actions";

const initial: SignInState = { status: "idle" };

export function EmailSignIn() {
  const [state, action, pending] = useActionState(sendSignInLink, initial);

  return (
    <form action={action} className="mt-6 grid max-w-xl gap-2">
      <label className="block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="ledger-input py-2!"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex max-w-full bg-ink px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
      >
        Email a sign-in link
      </button>
      {state.status === "sent" ? (
        <p className="text-sm leading-6 text-ink">Check that inbox for the sign-in link.</p>
      ) : null}
      {state.status === "error" ? (
        <p className="text-sm leading-6 text-oxide">{state.message}</p>
      ) : null}
    </form>
  );
}
