"use client";

import { useEffect, useState } from "react";
import type { GeocodeCandidate } from "../place-intake";

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; candidates: GeocodeCandidate[] };

export function MapLookup({
  name,
  city,
  selected,
  onSelect,
}: {
  name: string;
  city: string;
  selected: GeocodeCandidate | null;
  onSelect: (candidate: GeocodeCandidate | null) => void;
}) {
  const [state, setState] = useState<LookupState>({ status: "idle" });

  useEffect(() => {
    onSelect(null);
    setState({ status: "idle" });
  }, [name, city, onSelect]);

  async function findOnMap() {
    const trimmed = name.trim();
    if (trimmed.length < 2 || !city) {
      setState({
        status: "error",
        message: "Enter a name and choose a city before looking it up.",
      });
      return;
    }
    setState({ status: "loading" });
    onSelect(null);
    try {
      const params = new URLSearchParams({ name: trimmed, city });
      const response = await fetch(`/api/geocode?${params.toString()}`);
      const payload = (await response.json()) as {
        candidates?: GeocodeCandidate[];
        error?: string;
      };
      if (!response.ok) {
        setState({
          status: "error",
          message: payload.error?.trim() || "The map lookup did not finish.",
        });
        return;
      }
      const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
      setState({ status: "ready", candidates });
    } catch {
      setState({
        status: "error",
        message: "The map lookup did not finish. Try again in a moment.",
      });
    }
  }

  return (
    <div className="col-span-2 border border-ink/10 bg-paper-deep/60 px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Optional map match</p>
      <p className="mt-2 text-sm leading-6 text-ink">
        Find on the map looks up the name and city on OpenStreetMap. Pick one result to attach its
        coordinates to this unpublished submission. Nothing is published from this step.
      </p>
      <button
        type="button"
        onClick={() => void findOnMap()}
        disabled={state.status === "loading"}
        className="mt-3 inline-flex max-w-full border border-ink/20 bg-chart px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.16em] text-ink disabled:opacity-60"
      >
        {state.status === "loading" ? "Looking up…" : "Find on the map"}
      </button>
      {state.status === "error" ? (
        <p className="mt-3 text-sm leading-6 text-oxide">{state.message}</p>
      ) : null}
      {state.status === "ready" && state.candidates.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-muted">
          No OpenStreetMap matches came back. You can still submit without coordinates.
        </p>
      ) : null}
      {state.status === "ready" && state.candidates.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {state.candidates.map((candidate) => {
            const active = selected?.osmId === candidate.osmId;
            return (
              <li key={candidate.osmId}>
                <button
                  type="button"
                  onClick={() => onSelect(active ? null : candidate)}
                  aria-pressed={active}
                  className={`w-full border px-3 py-2 text-left text-sm leading-6 ${
                    active
                      ? "border-oxide bg-chart text-ink"
                      : "border-ink/15 bg-chart text-ink hover:border-ink/40"
                  }`}
                >
                  <span className="block font-medium">{candidate.name}</span>
                  <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-muted">
                    {candidate.latitude.toFixed(5)}, {candidate.longitude.toFixed(5)}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted">{candidate.displayName}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {selected ? (
        <p className="mt-3 text-sm leading-6 text-ink">
          Attached: {selected.name} ({selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
          ). Still unpublished until a person checks it.
        </p>
      ) : null}
    </div>
  );
}
