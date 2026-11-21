"use client";

import { useActionState, useState } from "react";
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
  const [confirming, setConfirming] = useState<null | "retention" | "all">(null);

  const notice =
    (logState.status !== "idle" && logState.message) ||
    (retState.status !== "idle" && retState.message) ||
    (purgeState.status !== "idle" && purgeState.message) ||
    null;
  const noticeError =
    logState.status === "error" || retState.status === "error" || purgeState.status === "error";

  const currentRetention =
    retentionDays === null
      ? "No retention period is set. Rows are kept until you purge them."
      : `Current retention is ${retentionDays} days.`;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-ink/10 pb-4">
        <div className="min-w-0">
          <p className="text-sm leading-6 text-ink">Storage</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Stdout <code className="font-mono text-[11px]">wp_probe</code> lines still write either
            way.
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
            loggingEnabled ? "border-lagoon/40 text-lagoon" : "border-ink/15 text-muted"
          }`}
        >
          {loggingEnabled ? "On" : "Off"}
        </span>
      </div>

      <form action={logAction} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="enabled" value={loggingEnabled ? "0" : "1"} />
        <button
          type="submit"
          disabled={logPending}
          aria-pressed={loggingEnabled}
          className="inline-flex items-center gap-3 border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ink disabled:opacity-60"
        >
          <span
            aria-hidden="true"
            className={`relative inline-flex h-5 w-9 shrink-0 border ${
              loggingEnabled ? "border-lagoon bg-lagoon/20" : "border-ink/30 bg-chart"
            }`}
          >
            <span
              className={`absolute top-0 h-5 w-4 bg-ink ${loggingEnabled ? "right-0" : "left-0"}`}
            />
          </span>
          {loggingEnabled ? "Turn storage off" : "Turn storage on"}
        </button>
      </form>

      <form action={retAction} className="grid gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Current retention</p>
          <p className="mt-1 text-sm leading-6 text-ink">
            {retentionDays === null ? "Not set" : `${retentionDays} days`}
          </p>
        </div>
        <label className="block min-w-0 max-w-sm">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
            Retention (days)
          </span>
          <input
            name="retention_days"
            type="number"
            min={1}
            max={3650}
            defaultValue={retentionDays ?? ""}
            placeholder="Leave blank to keep"
            className="ledger-input w-full max-w-48 py-2!"
            aria-describedby="retention-help"
          />
        </label>
        <p id="retention-help" className="max-w-xl text-sm leading-6 text-muted">
          {currentRetention} Enter a whole number from 1 to 3650 days, or leave blank to keep rows
          until you purge them.
        </p>
        <div>
          <button
            type="submit"
            disabled={retPending}
            className="inline-flex bg-ink px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
          >
            Save retention
          </button>
        </div>
      </form>

      <div className="grid gap-3 border-t border-ink/10 pt-4">
        {confirming === "retention" ? (
          <form action={purgeAction} className="grid gap-3">
            <input type="hidden" name="mode" value="retention" />
            <p className="text-sm leading-6 text-ink">
              This removes stored probes older than the retention period.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={purgePending || retentionDays === null}
                className="inline-flex bg-oxide px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
              >
                Confirm purge
              </button>
              <button
                type="button"
                disabled={purgePending}
                onClick={() => setConfirming(null)}
                className="inline-flex border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ink disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : confirming === "all" ? (
          <form action={purgeAction} className="grid gap-3">
            <input type="hidden" name="mode" value="all" />
            <p className="text-sm leading-6 text-ink">This removes every stored probe.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={purgePending}
                className="inline-flex bg-oxide px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
              >
                Confirm clear
              </button>
              <button
                type="button"
                disabled={purgePending}
                onClick={() => setConfirming(null)}
                className="inline-flex border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ink disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={purgePending || retentionDays === null}
              onClick={() => setConfirming("retention")}
              className="inline-flex border border-oxide/40 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-oxide disabled:opacity-60"
            >
              Purge older than retention
            </button>
            <button
              type="button"
              disabled={purgePending}
              onClick={() => setConfirming("all")}
              className="inline-flex border border-oxide/40 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-oxide disabled:opacity-60"
            >
              Clear all probes
            </button>
          </div>
        )}
      </div>

      {notice ? (
        <p className={`text-sm leading-6 ${noticeError ? "text-oxide" : "text-ink"}`}>{notice}</p>
      ) : null}
    </div>
  );
}
