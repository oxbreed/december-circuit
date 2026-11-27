"use client";

import { useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  isNewsletterSubscribed,
  subscribeNewsletterStorage,
} from "../newsletter-storage";
import { NewsletterForm } from "./newsletter-form";

function hideOnPath(pathname: string | null) {
  if (!pathname) return true;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname.startsWith("/preview/admin")) return true;
  if (pathname === "/sign-in" || pathname.startsWith("/sign-in/")) return true;
  if (pathname.startsWith("/auth/")) return true;
  return false;
}

function subscribe(onChange: () => void) {
  return subscribeNewsletterStorage(onChange);
}

export function NewsletterFooter({ live }: { live: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const subscribed = useSyncExternalStore(subscribe, isNewsletterSubscribed, () => false);
  const refValue = searchParams.get("ref");
  const referral =
    refValue && /^[A-Za-z0-9_-]{1,40}$/.test(refValue) ? refValue : null;

  if (hideOnPath(pathname)) return null;

  return (
    <div className="mt-8 max-w-xl">
      <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-lagoon">
        Email list
      </p>
      <p className="mt-2 font-display text-2xl leading-none tracking-tight text-ink">
        Get the free Lagos December events checklist
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        The confirmed Lagos nights, in one list. Weekly picks at first, then a daily
        Lagos brief from 15 December to 1 January.
      </p>
      <div className="mt-4">
        {!live ? (
          <p className="text-sm leading-6 text-ink">Email list coming soon.</p>
        ) : subscribed ? (
          <p className="text-sm leading-6 text-ink">
            You&apos;re on this browser&apos;s list. Check your inbox if you still need to
            confirm.
          </p>
        ) : (
          <NewsletterForm variant="footer" referral={referral} />
        )}
      </div>
    </div>
  );
}
