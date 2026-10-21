"use client";

import type { ReactNode } from "react";

export function LoadingLines({ label }: { label: string }) {
  return (
    <div role="status" className="max-w-xl py-2">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
        {label}
      </p>
      <div className="mt-4 space-y-3" aria-hidden="true">
        <div className="h-px w-full bg-line" />
        <div className="h-px w-4/5 bg-line" />
        <div className="h-px w-2/3 bg-line" />
        <div className="h-px w-1/2 bg-line" />
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
