"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  ANALYTICS_CONSENT_OPEN_EVENT,
  expireAnalyticsConsentIfStale,
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsent,
} from "../analytics-consent";

const linkClass = "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

const buttonClass =
  "inline-flex min-h-11 min-w-[8.5rem] flex-1 items-center justify-center border border-ink bg-chart px-4 font-sans text-sm font-semibold text-ink hover:bg-paper";

function hideOnPath(pathname: string | null) {
  if (!pathname) return false;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname.startsWith("/preview/admin")) return true;
  if (pathname === "/sign-in" || pathname.startsWith("/sign-in/")) return true;
  if (pathname.startsWith("/auth/")) return true;
  return false;
}

function subscribe(onStoreChange: () => void) {
  expireAnalyticsConsentIfStale();
  window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getConsentSnapshot() {
  return readAnalyticsConsent();
}

function getServerConsentSnapshot(): AnalyticsConsent | null {
  return null;
}

export function ConsentBanner() {
  const pathname = usePathname();
  const titleId = useId();
  const textId = useId();
  const consent = useSyncExternalStore(subscribe, getConsentSnapshot, getServerConsentSnapshot);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    function onOpen() {
      setSettingsOpen(true);
    }
    window.addEventListener(ANALYTICS_CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ANALYTICS_CONSENT_OPEN_EVENT, onOpen);
  }, []);

  if (hideOnPath(pathname)) return null;
  if (consent !== null && !settingsOpen) return null;

  function choose(value: AnalyticsConsent) {
    const previous = consent;
    writeAnalyticsConsent(value);
    setSettingsOpen(false);
    if (previous === "accepted" && value === "rejected") {
      window.location.reload();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={textId}
      className={`consent-banner fixed z-[45] border border-ink bg-chart p-4 text-ink shadow-[4px_4px_0_0_rgba(26,20,16,0.12)]${settingsOpen ? " consent-banner-open" : ""}`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-oxide">Cookies</p>
      <p id={titleId} className="mt-2 font-display text-2xl leading-none tracking-tight">
        Analytics on this site
      </p>
      <p id={textId} className="mt-3 text-sm leading-6 text-ink">
        We use analytics to count visits and measure how quickly pages load. They
        only run if you accept. Necessary storage, such as staying signed in, always
        works.{" "}
        <Link href="/cookies" className={linkClass}>
          Read the cookie notice
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={buttonClass} onClick={() => choose("rejected")}>
          Reject
        </button>
        <button type="button" className={buttonClass} onClick={() => choose("accepted")}>
          Accept
        </button>
      </div>
      {consent ? (
        <button
          type="button"
          className={`mt-3 inline-flex min-h-11 items-center font-sans text-sm text-muted ${linkClass}`}
          onClick={() => setSettingsOpen(false)}
        >
          Close without changing
        </button>
      ) : null}
    </div>
  );
}
