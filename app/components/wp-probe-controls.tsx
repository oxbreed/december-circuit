"use client";

import { useActionState } from "react";
import {
  purgeWpProbes,
  setWpProbeLogging,
  setWpProbeRetention,
  type ProbeActionState,
} from "../wp-probe-actions";

const idle: ProbeActionState = { status: "idle" };

export function WpProbeControls({
  loggingEnabled,
  retentionDays,
}: {
  loggingEnabled: boolean;
  retentionDays: number | null;
}) {
  const [logState, logAction, logPending] = useActionState(setWpProbeLogging, idle);
  const [retState, retAction, retPending] = useActionState(setWpProbeRetention, idle);
  const [purgeState, purgeAction, purgePending] = useActionState(purgeWpProbes, idle);

  const notice =
    (logState.status !== "idle" && logState.message) ||
    (retState.status !== "idle" && retState.message) ||
    (purgeState.status !== "idle" && purgeState.message) ||
    null;
  const noticeError =
    logState.status === "error" || retState.status === "error" || purgeState.status === "error";

  return (
    <div className="mt-4 grid gap-4">
      <form action={logAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="enabled" value={loggingEnabled ? "0" : "1"} />
        <button
          type="submit"
          disabled={logPending}
          className="inline-flex bg-ink px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
        >
          {loggingEnabled ? "Disable storage" : "Enable storage"}
        </button>
        <p className="text-sm leading-6 text-muted">
          Storage is {loggingEnabled ? "on" : "off"}. Stdout `wp_probe` lines still write either way.
        </p>
      </form>

      <form action={retAction} className="flex flex-wrap items-end gap-2">
        <label className="block min-w-0">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
            Retention (days)
          </span>
          <input
            name="retention_days"
            type="number"
            min={1}
            max={3650}
            defaultValue={retentionDays ?? ""}
            placeholder="Blank = keep"
            className="ledger-input w-36 py-2!"
          />
        </label>
        <button
          type="submit"
          disabled={retPending}
          className="inline-flex bg-ink px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
        >
          Save retention
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <form action={purgeAction}>
          <input type="hidden" name="mode" value="retention" />
          <button
            type="submit"
            disabled={purgePending || retentionDays === null}
            className="inline-flex border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ink disabled:opacity-60"
          >
            Purge older than retention
          </button>
        </form>
        <form action={purgeAction}>
          <input type="hidden" name="mode" value="all" />
          <button
            type="submit"
            disabled={purgePending}
            className="inline-flex border border-oxide/40 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-oxide disabled:opacity-60"
          >
            Clear all probes
          </button>
        </form>
      </div>

      {notice ? (
        <p className={`text-sm leading-6 ${noticeError ? "text-oxide" : "text-ink"}`}>{notice}</p>
      ) : null}
    </div>
  );
}
