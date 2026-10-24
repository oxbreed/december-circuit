"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const guideName = "December guide";

const greeting =
  "Hi — I’m here to help you plan. Ask me about visas, confirmed events, flights, or how to list something. I’ll stick to what’s on dirtydecember.info.";

const suggestions = [
  "Visas and entry for Nigeria or Ghana?",
  "What confirmed events are on?",
  "How do I list an event?",
  "How do flight searches work?",
] as const;

export function SupportChat({ liveModel }: { liveModel: boolean }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: greeting },
  ]);
  const [chipsVisible, setChipsVisible] = useState(true);
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
            "That didn’t come through. Try again in a moment, or write hello@dirtydecember.info.",
        );
        return;
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.reply! },
      ]);
    } catch {
      setError(
        "I couldn’t reach support just now. Try again in a moment, or write hello@dirtydecember.info.",
      );
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <div className="support-chat pointer-events-none fixed inset-x-0 z-50 flex justify-end px-3 lg:inset-x-auto lg:right-5 lg:px-0">
      <div className="pointer-events-auto flex w-full max-w-[22rem] flex-col items-end gap-2">
        {open ? (
          <section
            id={panelId}
            aria-label="Ask support chat"
            className="support-chat-panel flex max-h-[min(30rem,calc(100svh-var(--clock-strip)-var(--mobile-bar,0px)-5.5rem))] w-full flex-col border border-ink/15 bg-chart shadow-[0_12px_40px_rgba(26,20,16,0.12)] lg:max-h-[min(34rem,calc(100svh-6rem))]"
          >
            <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-brass">
                  Ask support
                </p>
                <p className="mt-1 text-sm leading-5 text-muted">
                  Chat with {guideName} about visas, events, flights, and listing.
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
              ref={listRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm leading-6 text-ink"
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
              {error ? <p className="text-sm text-oxide">{error}</p> : null}
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
          </section>
        ) : null}

        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          className="border border-ink/15 bg-paper px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ink shadow-[0_8px_24px_rgba(26,20,16,0.1)] hover:border-oxide hover:text-oxide"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close chat" : "Ask support"}
        </button>
      </div>
    </div>
  );
}
