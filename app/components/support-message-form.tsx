"use client";

import { useState, type FormEvent } from "react";
import { supportTopics } from "../support/topics";

type Status = "idle" | "pending" | "ok" | "error";

export function SupportMessageForm({ formId, feedback = false }: { formId: string; feedback?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === "pending") return;
    setError(null);
    setStatus("pending");

    const pagePath =
      typeof window !== "undefined" ? window.location.pathname : undefined;

    try {
      const response = await fetch("/api/support/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          topic: feedback ? "feedback" : topic,
          message,
          pagePath,
          website,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setStatus("error");
        setError(
          data.error ||
            "That did not come through. Try again in a moment, or write hello@dirtydecember.info.",
        );
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("error");
      setError(
        "The form could not reach the server just now. Try again in a moment, or write hello@dirtydecember.info.",
      );
    }
  }

  if (status === "ok") {
    return (
      <div className="px-4 py-5" role="status" aria-live="polite">
        <p className="text-sm leading-6 text-ink">Thank you. Your message is with the team.</p>
        {!feedback && <p className="mt-2 text-sm leading-6 text-muted">
          A reply will come to {email} from hello@dirtydecember.info, or from
          partners@dirtydecember.info for a partnership note.
        </p>}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 px-4 py-4">
      <p className="text-sm leading-6 text-muted">
        {feedback
          ? "Tell us what worked, what needs correcting, or what you’d like us to add. Your feedback goes privately to the Dirty December team."
          : "Leave your name, email, and a short note. The team reads these in the support inbox and replies by email."}
      </p>

      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Company website</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <label className="grid gap-1">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Name</span>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          required
          maxLength={80}
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="ledger-input text-sm leading-5"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Email</span>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          required
          maxLength={320}
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="ledger-input text-sm leading-5"
        />
      </label>

      {!feedback && <label className="grid gap-1">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Topic</span>
        <select
          id={`${formId}-topic`}
          name="topic"
          required
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="ledger-input py-2! text-sm leading-5"
        >
          <option value="">Choose a topic</option>
          {supportTopics.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>}

      <label className="grid gap-1">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Message</span>
        <textarea
          id={`${formId}-message`}
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="ledger-input resize-none text-sm leading-5"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
          {message.trim().length}/2000
        </p>
        <button
          type="submit"
          disabled={status === "pending"}
          className="bg-oxide px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-40"
        >
          {status === "pending" ? "Sending…" : feedback ? "Send feedback" : "Send message"}
        </button>
      </div>

      {error ? (
        <p className="text-sm leading-6 text-oxide" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
