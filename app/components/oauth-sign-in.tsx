"use client";

import { useActionState } from "react";
import { signInWithOAuthProvider, type OAuthSignInState } from "../auth/oauth-actions";

const initial: OAuthSignInState = { status: "idle" };

type OAuthSignInProps = {
  googleConfigured: boolean;
  appleConfigured: boolean;
};

export function OAuthSignIn({ googleConfigured, appleConfigured }: OAuthSignInProps) {
  const [state, action, pending] = useActionState(signInWithOAuthProvider, initial);

  return (
    <div className="mt-6 grid max-w-xl gap-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Or continue with</p>
      <form action={action}>
        <input type="hidden" name="provider" value="google" />
        <button
          type="submit"
          disabled={pending || !googleConfigured}
          className="inline-flex w-full max-w-full border border-ink/25 bg-paper px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-ink hover:border-oxide hover:text-oxide disabled:cursor-not-allowed disabled:opacity-50"
        >
          Google
        </button>
      </form>
      {!googleConfigured ? (
        <p className="text-sm leading-6 text-muted">Google sign-in is not configured on this deployment.</p>
      ) : null}
      <form action={action}>
        <input type="hidden" name="provider" value="apple" />
        <button
          type="submit"
          disabled={pending || !appleConfigured}
          className="inline-flex w-full max-w-full border border-ink/25 bg-paper px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-ink hover:border-oxide hover:text-oxide disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apple
        </button>
      </form>
      {!appleConfigured ? (
        <p className="text-sm leading-6 text-muted">Apple sign-in is not configured on this deployment.</p>
      ) : null}
      {state.status === "error" ? (
        <p className="text-sm leading-6 text-oxide">{state.message}</p>
      ) : null}
    </div>
  );
}