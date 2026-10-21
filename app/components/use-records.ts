"use client";

import { useEffect, useState } from "react";

export type LoadState<T> =
  | { status: "loading"; data: null }
  | { status: "ready"; data: T }
  | { status: "error"; data: null };

type Tracked<T> = LoadState<T> & { url: string; attempt: number };

export function useRecords<T>(url: string): LoadState<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Tracked<T>>({
    status: "loading",
    data: null,
    url,
    attempt: 0,
  });

  if (state.url !== url || state.attempt !== attempt) {
    setState({ status: "loading", data: null, url, attempt });
  }

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("shape");
        return data as T;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ status: "ready", data, url, attempt });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ status: "error", data: null, url, attempt });
      });

    return () => controller.abort();
  }, [url, attempt]);

  const view: LoadState<T> =
    state.status === "ready"
      ? { status: "ready", data: state.data }
      : state.status === "error"
        ? { status: "error", data: null }
        : { status: "loading", data: null };

  return {
    ...view,
    retry: () => setAttempt((value) => value + 1),
  };
}
