"use client";

import { lazy, Suspense, useEffect, useState } from "react";

const SiteAnalytics = lazy(() => import("./site-analytics").then((module) => ({ default: module.SiteAnalytics })));

export function DeferredSiteAnalytics({ gaMeasurementId }: { gaMeasurementId?: string | null }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idle: number | undefined;
    let timer: number | undefined;

    function schedule() {
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      } else {
        timer = window.setTimeout(() => setReady(true), 1000);
      }
    }

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <SiteAnalytics gaMeasurementId={gaMeasurementId} />
    </Suspense>
  );
}
