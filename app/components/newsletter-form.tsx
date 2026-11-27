"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { markNewsletterSubscribed } from "../newsletter-storage";

const consentCopy =
  "I want Dirty December event picks from Oxbreed Management at hello@dirtydecember.info. Weekly at first, then daily from 15 December to 1 January. I can unsubscribe at any time. See the ";

export function NewsletterForm({
  variant,
  referral,
  idPrefix,
}: {
  variant: "dialog" | "banner" | "footer";
  referral?: string | null;
  idPrefix?: string;
}) {
  const reactId = useId();
  const baseId = idPrefix ?? reactId;
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "confirm" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const compact = variant === "banner";
  const emailId = `${baseId}-email`;
  const consentId = `${baseId}-consent`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending") return;
    setStatus("pending");
    setError(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent,
          website,
          ref: referral ?? undefined,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; status?: string; error?: string };
      if (response.status === 503 || data.status === "unavailable") {
        setStatus("error");
        setError(data.error ?? "Email list coming soon.");
        return;
      }
      if (!response.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Send the form again in a moment.");
        return;
      }
      markNewsletterSubscribed();
      setStatus("confirm");
    } catch {
      setStatus("error");
      setError("Send the form again in a moment.");
    }
  }

  if (status === "confirm") {
    return (
      <p className="text-sm leading-6 text-ink" role="status">
        Check that inbox and confirm your email. The Lagos December events checklist
        is sent after you confirm.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-3" : "grid gap-3"}>
      <div className={compact ? "sm:col-span-1" : undefined}>
        <label htmlFor={emailId} className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          maxLength={320}
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="ledger-input py-2! text-sm leading-5"
        />
      </div>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
      </div>
      <div className={compact ? "sm:col-span-2" : undefined}>
        <label htmlFor={consentId} className="flex items-start gap-2 text-sm leading-5 text-ink">
          <input
            id={consentId}
            name="consent"
            type="checkbox"
            required
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 border border-ink accent-oxide"
          />
          <span>
            {consentCopy}
            <Link href="/privacy" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              privacy notice
            </Link>
            .
          </span>
        </label>
      </div>
      <div className={compact ? "sm:col-start-2 sm:row-start-1 sm:self-end" : undefined}>
        <button
          type="submit"
          disabled={status === "pending"}
          className="inline-flex h-11 w-full items-center justify-center bg-oxide px-4 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60 sm:w-auto"
        >
          {status === "pending" ? "Sending…" : "Send me the list"}
        </button>
      </div>
      {error ? (
        <p className={`text-sm leading-6 text-oxide ${compact ? "sm:col-span-2" : ""}`} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
