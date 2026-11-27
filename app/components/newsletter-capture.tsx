"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  expireAnalyticsConsentIfStale,
  readAnalyticsConsent,
} from "../analytics-consent";
import {
  dismissNewsletterCapture,
  isNewsletterDismissed,
  isNewsletterSubscribed,
  subscribeNewsletterStorage,
} from "../newsletter-storage";
import { NewsletterForm } from "./newsletter-form";

const POPUP_DELAY_MS = 18_000;

function hideOnPath(pathname: string | null) {
  if (!pathname) return true;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname.startsWith("/preview/admin")) return true;
  if (pathname === "/sign-in" || pathname.startsWith("/sign-in/")) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.startsWith("/newsletter/")) return true;
  return false;
}

function showCaptureOnPath(pathname: string | null) {
  if (!pathname || hideOnPath(pathname)) return false;
  if (pathname === "/") return true;
  const prefixes = ["/events", "/guides", "/guide", "/detty-december", "/cities"];
  return prefixes.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function subscribeConsent(onChange: () => void) {
  expireAnalyticsConsentIfStale();
  window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function subscribeCapture(onChange: () => void) {
  const offConsent = subscribeConsent(onChange);
  const offStorage = subscribeNewsletterStorage(onChange);
  return () => {
    offConsent();
    offStorage();
  };
}

function getCaptureSnapshot() {
  return {
    cookieReady: readAnalyticsConsent() !== null,
    dismissed: isNewsletterDismissed(),
    subscribed: isNewsletterSubscribed(),
  };
}

function getServerCaptureSnapshot() {
  return { cookieReady: false, dismissed: false, subscribed: false };
}

function readReferral(searchParams: { get: (name: string) => string | null }) {
  const value = searchParams.get("ref");
  if (!value || !/^[A-Za-z0-9_-]{1,40}$/.test(value)) return null;
  return value;
}

export function NewsletterCapture({ live }: { live: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const titleId = useId();
  const state = useSyncExternalStore(subscribeCapture, getCaptureSnapshot, getServerCaptureSnapshot);
  const [popupOpen, setPopupOpen] = useState(false);
  const shownRef = useRef(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const referral = readReferral(searchParams);

  const onCapturePath = showCaptureOnPath(pathname);
  const canPrompt =
    live && onCapturePath && state.cookieReady && !state.dismissed && !state.subscribed;

  useEffect(() => {
    if (!canPrompt || shownRef.current) return;

    function openOnce() {
      if (shownRef.current) return;
      shownRef.current = true;
      setPopupOpen(true);
    }

    const timer = window.setTimeout(openOnce, POPUP_DELAY_MS);

    function onMouseOut(event: MouseEvent) {
      if (event.clientY > 0) return;
      if (event.relatedTarget) return;
      openOnce();
    }

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (finePointer) {
      document.addEventListener("mouseout", onMouseOut);
    }

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [canPrompt]);

  useEffect(() => {
    if (!popupOpen) return;
    const previous = document.activeElement;
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismissNewsletterCapture();
        setPopupOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [popupOpen]);

  if (!live || hideOnPath(pathname) || state.subscribed) return null;

  function dismiss() {
    dismissNewsletterCapture();
    setPopupOpen(false);
  }

  const showSticky = canPrompt && !popupOpen;
  const showPopup = canPrompt && popupOpen;

  return (
    <>
      {showSticky ? (
        <aside
          className="newsletter-sticky"
          aria-label="Email list"
        >
          <div className="newsletter-sticky-inner">
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-oxide">
                Free checklist
              </p>
              <p className="mt-1 font-display text-xl leading-none tracking-tight text-ink md:text-2xl">
                Get the free Lagos December events checklist
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                The confirmed Lagos nights, in one list.
              </p>
              <div className="mt-3">
                <NewsletterForm variant="banner" referral={referral} idPrefix={`${titleId}-banner`} />
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-11 shrink-0 items-center px-2 text-sm text-muted underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Not now
            </button>
          </div>
        </aside>
      ) : null}

      {showPopup ? (
        <div className="newsletter-dialog-root">
          <button
            type="button"
            className="newsletter-dialog-backdrop"
            aria-label="Close signup"
            onClick={dismiss}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="newsletter-dialog"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-3 inline-flex h-11 min-w-11 items-center justify-center text-sm text-muted hover:text-oxide"
            >
              Close
            </button>
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-oxide">
              Free checklist
            </p>
            <h2 id={titleId} className="mt-3 font-display text-3xl leading-none tracking-tight text-ink md:text-4xl">
              Get the free Lagos December events checklist
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              The confirmed Lagos nights, in one list, sent to your inbox. December fills up
              fast — take the list with you.
            </p>
            <div className="mt-6">
              <NewsletterForm variant="dialog" referral={referral} idPrefix={`${titleId}-dialog`} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
