"use client";

import type { ReactNode } from "react";

export function VisitorExtrasFold({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="mt-8 border border-ink/15 bg-paper/80">
      <summary className="cursor-pointer px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-oxide">
        <span className="underline decoration-oxide/40 underline-offset-4">{summary}</span>
      </summary>
      <div className="border-t border-ink/10 px-5 pb-6 pt-2">{children}</div>
    </details>
  );
}
