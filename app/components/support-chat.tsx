"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { SupportMessageForm } from "./support-message-form";

type Message = {
  role: "user" | "assistant";
  text: string;
};

type PanelTab = "ask" | "message";

const guideName = "December guide";

const greeting =
  "Hi. I’m here to help you plan. Ask me about visas, confirmed events, flights, or how to list something. I’ll stick to what’s on dirtydecember.info. If you need a person, use Leave a message.";

const suggestions = [
  "Visas and entry for Nigeria or Ghana?",
  "What confirmed events are on?",
  "How do I list an event?",
  "How do flight searches work?",
] as const;

function hiddenPath(pathname: string | null) {
  if (!pathname) return false;
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/preview/admin") ||
    pathname === "/sign-in" ||
    pathname.startsWith("/sign-in/") ||
    pathname.startsWith("/auth/")
  );
}

export function SupportChat({ liveModel }: { liveModel: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("ask");
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: greeting },
  ]);
  const [chipsVisible, setChipsVisible] = useState(true);
  const panelId = useId();
  const titleId = `${panelId}-title`;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    if (tab === "ask") {
      const node = inputRef.current;
      if (node) node.focus();
    }
  }, [open, tab]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    if (messages.length <= 1 && !pending && !error) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, open, pending, error, tab]);

  useEffect(() => {
    if (!open) return;
    const root = panelRef.current;
    if (!root) return;
    const focusable = () =>
      [
        ...root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((node) => !node.closest("[aria-hidden='true']") && node.tabIndex !== -1);

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    return () => {
      toggle?.focus();
    };
  }, [open]);

  async function ask(text: string) {
    const trimmed = text.replace(/\s+/g, " ").trim();
    if (!trimmed || pending) return;

    setQuestion("");
    setError(null);
    setChipsVisible(false);

    const prior = messages;
    setMessages([...prior, { role: "user", text: trimmed }]);
    setPending(true);

    const history = prior.slice(-6);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history }),
      });
      const data = (await response.json()) as {
        reply?: string;
        error?: string;
        mode?: string;
      };

      if (!response.ok || !data.reply) {
        setError(
          data.error ||
            "That did not come through. Try again in a moment, or write hello@dirtydecember.info.",
        );
        return;
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.reply! },
      ]);
    } catch {
      setError(
        "I could not reach support just now. Try again in a moment, or write hello@dirtydecember.info.",
      );
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  if (hiddenPath(pathname)) return null;

  return (
    <div className={`support-chat pointer-events-none fixed inset-x-0 z-50 flex justify-end px-3 lg:inset-x-auto lg:right-5 lg:px-0${pathname === "/" ? " support-chat-home" : ""}`}>
      <div className="pointer-events-auto flex w-full max-w-[22rem] flex-col items-end gap-2">
        {open ? (
          <section
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="support-chat-panel flex max-h-[min(32rem,calc(100svh-var(--clock-strip)-var(--mobile-bar,0px)-5.5rem))] w-full flex-col border border-ink/15 bg-chart shadow-[0_12px_40px_rgba(26,20,16,0.12)] lg:max-h-[min(36rem,calc(100svh-6rem))]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-3">
              <div>
                <p
                  id={titleId}
                  className="text-[11px] uppercase tracking-[0.22em] text-brass"
                >
                  Ask support
                </p>
                <p className="mt-1 text-sm leading-5 text-muted">
                  Chat with {guideName}, or leave a message for the team.
                  {liveModel ? null : " Happy to help from what’s listed."}
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
              role="tablist"
              aria-label="Support options"
              className="flex border-b border-ink/10"
            >
              <button
                type="button"
                role="tab"
                id={`${panelId}-tab-ask`}
                aria-selected={tab === "ask"}
                aria-controls={`${panelId}-panel-ask`}
                className={`flex-1 px-3 py-2 text-[11px] uppercase tracking-[0.14em] ${
                  tab === "ask" ? "bg-ink text-chart" : "bg-chart text-ink hover:text-oxide"
                }`}
                onClick={() => setTab("ask")}
              >
                Ask
              </button>
              <button
                type="button"
                role="tab"
                id={`${panelId}-tab-message`}
                aria-selected={tab === "message"}
                aria-controls={`${panelId}-panel-message`}
                className={`flex-1 px-3 py-2 text-[11px] uppercase tracking-[0.14em] ${
                  tab === "message" ? "bg-ink text-chart" : "bg-chart text-ink hover:text-oxide"
                }`}
                onClick={() => setTab("message")}
              >
                Leave a message
              </button>
            </div>

            {tab === "ask" ? (
              <div
                id={`${panelId}-panel-ask`}
                role="tabpanel"
                aria-labelledby={`${panelId}-tab-ask`}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div
                  ref={listRef}
                  className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm leading-6 text-ink"
                  aria-live="polite"
                >
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={
                        message.role === "user"
                          ? "ml-8 flex justify-end"
                          : "mr-8 flex justify-start"
                      }
                    >
                      <div
                        className={
                          message.role === "user"
                            ? "max-w-full border border-oxide/35 bg-paper px-3 py-2"
                            : "max-w-full border border-lagoon/35 bg-paper-deep/60 px-3 py-2"
                        }
                      >
                        <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-muted">
                          {message.role === "user" ? "You" : guideName}
                        </span>
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>
                  ))}

                  {chipsVisible && !pending ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="border border-brass/45 bg-paper px-2.5 py-1.5 text-left text-[11px] uppercase tracking-[0.12em] text-ink hover:border-oxide hover:text-oxide"
                          onClick={() => void ask(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {pending ? (
                    <p className="text-sm leading-5 text-muted">One moment…</p>
                  ) : null}
                  {error ? (
                    <p className="text-sm text-oxide" role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>

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
                    placeholder="Type a question…"
                    className="ledger-input resize-none text-sm leading-5"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void ask(question);
                      }
                    }}
                  />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                      Happy to help
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
              </div>
            ) : (
              <div
                id={`${panelId}-panel-message`}
                role="tabpanel"
                aria-labelledby={`${panelId}-tab-message`}
                className="min-h-0 flex-1 overflow-y-auto"
              >
                <SupportMessageForm formId={`${panelId}-message`} />
              </div>
            )}
          </section>
        ) : null}

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-haspopup="dialog"
          className="min-h-11 border border-ink/15 bg-paper px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ink shadow-[0_8px_24px_rgba(26,20,16,0.1)] hover:border-oxide hover:text-oxide"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close support" : "Ask support"}
        </button>
      </div>
    </div>
  );
}
