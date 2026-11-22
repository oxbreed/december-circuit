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
  "inline-flex h-11 min-w-[5.75rem] items-center justify-center border border-ink bg-chart px-3 font-sans text-sm font-semibold text-ink hover:bg-paper";

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
    <aside
      role="region"
      aria-labelledby={titleId}
      aria-describedby={textId}
      className={`consent-banner${settingsOpen ? " consent-banner-open" : ""}`}
    >
      <div className="consent-banner-inner">
        <p id={titleId} className="consent-banner-kicker">
          Cookies
        </p>
        <p id={textId} className="consent-banner-copy">
          We use analytics only if you accept.{" "}
          <Link href="/cookies" className={linkClass}>
            Cookie notice
          </Link>
          .
        </p>
        <div className="consent-banner-actions">
          <button type="button" className={buttonClass} onClick={() => choose("rejected")}>
            Reject
          </button>
          <button type="button" className={buttonClass} onClick={() => choose("accepted")}>
            Accept
          </button>
          {consent ? (
            <button
              type="button"
              className={`inline-flex h-11 items-center font-sans text-sm text-muted ${linkClass}`}
              onClick={() => setSettingsOpen(false)}
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
