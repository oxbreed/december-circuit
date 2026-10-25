"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function shouldSkipPath(path: string) {
  if (!path) return true;
  if (path.startsWith("/admin")) return true;
  if (path.startsWith("/api/")) return true;
  if (path.startsWith("/auth/")) return true;
  return false;
}

function PageviewBeacon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || shouldSkipPath(pathname)) return;

    const query = searchParams?.toString() ?? "";
    const path = query ? `${pathname}?${query}` : pathname;
    if (lastSent.current === path) return;
    lastSent.current = path;

    const body = JSON.stringify({
      path: path.length > 512 ? path.slice(0, 512) : path,
      referrer:
        typeof document !== "undefined" && document.referrer
          ? document.referrer.slice(0, 512)
          : null,
    });

    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/pageview", blob);
        return;
      }
    } catch {
      // Fall through to fetch.
    }

    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Best-effort; never block navigation.
    });
  }, [pathname, searchParams]);

  return null;
}

function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  useEffect(() => {
    if (!measurementId || typeof window === "undefined") return;
    const existing = document.querySelector(`script[data-ga-id="${measurementId}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.gaId = measurementId;
    document.head.appendChild(script);

    const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag(...args: unknown[]) {
      w.dataLayer?.push(args);
    };
    w.gtag("js", new Date());
    w.gtag("config", measurementId, { anonymize_ip: true });
  }, [measurementId]);

  return null;
}

export function SiteAnalytics({
  gaMeasurementId,
}: {
  gaMeasurementId?: string | null;
}) {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <Suspense fallback={null}>
        <PageviewBeacon />
      </Suspense>
      {gaMeasurementId ? <GoogleAnalytics measurementId={gaMeasurementId} /> : null}
    </>
  );
}
