"use client";

import { useActionState } from "react";
import type { AdminActionState } from "../admin-actions";

export function ActionStatus({ state }: { state: AdminActionState }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <p className={`text-sm leading-6 ${state.status === "ok" ? "text-lagoon" : "text-oxide"}`}>
      {state.message}
    </p>
  );
}

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as AdminActionState);
  return (
    <form action={formAction} className={className}>
      <fieldset disabled={pending} className="min-w-0">
        {children}
        <ActionStatus state={state} />
        {pending ? <p className="text-sm leading-6 text-muted">Saving…</p> : null}
      </fieldset>
    </form>
  );
}
