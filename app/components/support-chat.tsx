"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const quickLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/guide#entry", label: "Visa and entry" },
  { href: "/list", label: "List an event" },
] as const;

const offlineCopy =
  "Live AI answers are not connected on this deploy. The links below cover the same ground as the FAQ and the guide.";

export function SupportChat({ configured }: { configured: boolean }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const panelId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const node = inputRef.current;
    if (node) node.focus();
  }, [open]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, open, pending]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!configured || pending) return;
    const text = question.replace(/\s+/g, " ").trim();
    if (!text) return;

    setQuestion("");
    setError(null);
    setMessages((current) => [...current, { role: "user", text }]);
    setPending(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = (await response.json()) as {
        reply?: string;
        error?: string;
        configured?: boolean;
      };

      if (!response.ok || !data.reply) {
        setError(
          data.error ||
            "No answer came back. Try again, or write to hello@dirtydecember.info.",
        );
        return;
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.reply! },
      ]);
    } catch {
      setError(
        "The support service could not be reached. Try again, or write to hello@dirtydecember.info.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="support-chat pointer-events-none fixed inset-x-0 z-50 flex justify-end px-3 lg:inset-x-auto lg:right-5 lg:px-0">
      <div className="pointer-events-auto flex w-full max-w-[22rem] flex-col items-end gap-2">
        {open ? (
          <section
            id={panelId}
            aria-label="Support chat"
            className="support-chat-panel flex max-h-[min(28rem,calc(100svh-var(--clock-strip)-var(--mobile-bar,0px)-5.5rem))] w-full flex-col border border-ink/15 bg-chart shadow-[0_12px_40px_rgba(26,20,16,0.12)] lg:max-h-[min(32rem,calc(100svh-6rem))]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-brass">
                  Support
                </p>
                <p className="mt-1 text-sm leading-5 text-muted">
                  Answers from this site’s FAQ, visa guide, and confirmed events.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 border border-ink/15 bg-paper px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-ink hover:border-oxide hover:text-oxide"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </header>

            <div
              ref={listRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm leading-6 text-ink"
            >
              {!configured ? (
                <div className="space-y-3">
                  <p>{offlineCopy}</p>
                  <ul className="flex flex-col gap-2">
                    {quickLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="inline-flex border border-brass/45 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ink hover:border-oxide hover:text-oxide"
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-muted">
                  Ask about visas, confirmed events, or how this directory works.
                  It will not invent prices or bookings.
                </p>
              ) : (
                messages.map((message, index) => (
                  <p
                    key={`${message.role}-${index}`}
                    className={
                      message.role === "user"
                        ? "border-l-2 border-oxide/70 pl-3 text-ink"
                        : "border-l-2 border-lagoon/70 pl-3 text-ink"
                    }
                  >
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-muted">
                      {message.role === "user" ? "You" : "Support"}
                    </span>
                    {message.text}
                  </p>
                ))
              )}
              {pending ? (
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  Looking it up…
                </p>
              ) : null}
              {error ? <p className="text-sm text-oxide">{error}</p> : null}
            </div>

            {configured ? (
              <form
                onSubmit={onSubmit}
                className="border-t border-ink/10 px-3 py-3"
              >
                <label className="sr-only" htmlFor={`${panelId}-ask`}>
                  Your question
                </label>
                <textarea
                  id={`${panelId}-ask`}
                  ref={inputRef}
                  rows={2}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  maxLength={500}
                  disabled={pending}
                  placeholder="Ask a short question"
                  className="ledger-input resize-none text-sm leading-5"
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    Site content only
                  </p>
                  <button
                    type="submit"
                    disabled={pending || question.trim().length === 0}
                    className="bg-oxide px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
              </form>
            ) : null}
          </section>
        ) : null}

        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          className="border border-ink/15 bg-paper px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ink shadow-[0_8px_24px_rgba(26,20,16,0.1)] hover:border-oxide hover:text-oxide"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close support" : "Support"}
        </button>
      </div>
    </div>
  );
}
