"use client";

import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from "react";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  expireAnalyticsConsentIfStale,
  hasAnalyticsConsent,
} from "../analytics-consent";

const SiteAnalytics = lazy(() => import("./site-analytics").then((module) => ({ default: module.SiteAnalytics })));

function subscribe(onStoreChange: () => void) {
  expireAnalyticsConsentIfStale();
  window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getAllowedSnapshot() {
  return hasAnalyticsConsent();
}

function getServerAllowedSnapshot() {
  return false;
}

export function DeferredSiteAnalytics({ gaMeasurementId }: { gaMeasurementId?: string | null }) {
  const allowed = useSyncExternalStore(subscribe, getAllowedSnapshot, getServerAllowedSnapshot);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    function start() {
      setPageReady(true);
    }

    if (document.readyState === "complete") {
      const timer = window.setTimeout(start, 0);
      return () => window.clearTimeout(timer);
    }

    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  if (!allowed || !pageReady) return null;
  return (
    <Suspense fallback={null}>
      <SiteAnalytics gaMeasurementId={gaMeasurementId} />
    </Suspense>
  );
}
