"use client";

import type { ReactNode } from "react";

export function LoadingLines({ label }: { label?: string } = {}) {
  void label;
  return (
    <div role="status" aria-busy="true" className="max-w-xl py-2">
      <div className="space-y-3" aria-hidden="true">
        <div className="h-3 w-full animate-pulse bg-ink/10" />
        <div className="h-3 w-4/5 animate-pulse bg-ink/10" />
        <div className="h-3 w-2/3 animate-pulse bg-ink/10" />
        <div className="h-3 w-1/2 animate-pulse bg-ink/10" />
      </div>
    </div>
  );
}

export function ErrorNote({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="max-w-xl border border-oxide px-4 py-4">
      <p className="leading-7">{message}</p>
      <button type="button" onClick={onRetry} className="chip mt-4">
        Try again
      </button>
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-xl border border-dashed border-ink/30 px-4 py-6 leading-7 text-muted">
      {children}
    </p>
  );
}
