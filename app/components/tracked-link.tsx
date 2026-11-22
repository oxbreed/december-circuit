"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";
import { hasAnalyticsConsent } from "../analytics-consent";

/**
 * Client-side click events for outbound money links. Fires a Vercel Web
 * Analytics custom event, and a GA event when GA has been turned on.
 * Navigation is never blocked.
 */

type EventName = "outbound_go" | "stay_click" | "ticket_click" | "featured_enquiry" | "sponsor_click";
type Props = Record<string, string | number | boolean | null>;

export function trackClick(name: EventName, props: Props) {
  if (!hasAnalyticsConsent()) return;
  try {
    track(name, props);
  } catch {
    // Analytics is best-effort.
  }
  try {
    const w = window as Window & { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === "function") w.gtag("event", name, props);
  } catch {
    // GA is optional.
  }
}

function beacon(body: Record<string, string>) {
  if (!hasAnalyticsConsent()) return;
  try {
    const json = JSON.stringify({ ...body, path: window.location.pathname });
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([json], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/outbound", blob)) return;
    }
    void fetch("/api/analytics/outbound", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Best-effort.
  }
}

/** Link to a first-party /go/<partner> redirect. */
export function PartnerLink({
  href,
  partner,
  placement,
  event,
  earning,
  className,
  children,
}: {
  href: string;
  partner: string;
  placement: string;
  event: "outbound_go" | "stay_click";
  earning: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel={earning ? "sponsored nofollow noopener" : "nofollow noopener"}
      className={className}
      onClick={() => trackClick(event, { partner, placement, earning })}
    >
      {children}
    </a>
  );
}

/**
 * Ticket link that keeps the organiser's real URL (so an organiser's own
 * tracked URL keeps working) and logs the click first-party.
 */
export function TicketLink({
  href,
  eventSlug,
  placement,
  className,
  children,
}: {
  href: string;
  eventSlug: string;
  placement: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        trackClick("ticket_click", { event: eventSlug, placement });
        beacon({ kind: "ticket", target: eventSlug, placement });
      }}
    >
      {children}
    </a>
  );
}

/** Paid sponsor link: labelled, rel="sponsored", click logged first-party. */
export function SponsorLink({
  href,
  slug,
  className,
  children,
}: {
  href: string;
  slug?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener"
      className={className}
      onClick={() => {
        trackClick("sponsor_click", { sponsor: slug ?? "unnamed" });
        if (slug) beacon({ kind: "sponsor", target: slug, placement: "sponsor-spot" });
      }}
    >
      {children}
    </a>
  );
}

/** Mail or form link for a featured-placement enquiry. */
export function FeaturedEnquiryLink({
  href,
  placement,
  className,
  children,
}: {
  href: string;
  placement: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className={className} onClick={() => trackClick("featured_enquiry", { placement })}>
      {children}
    </a>
  );
}
