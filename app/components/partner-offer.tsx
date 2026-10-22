"use client";

import type { FormEvent } from "react";

const fields = [
  { name: "business", label: "Business name", type: "text", wide: false },
  { name: "offer", label: "What they offer", type: "text", wide: false },
  { name: "link", label: "Public link", type: "url", wide: true },
  { name: "email", label: "Sender’s email", type: "email", wide: true },
] as const;

export function PartnerOffer({
  subject,
  button,
}: {
  subject: string;
  button: string;
}) {
  function openMail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = fields
      .map((field) => `${field.label}: ${String(data.get(field.name) ?? "").trim()}`)
      .join("\n");
    const href = `mailto:partners@dirtydecember.info?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  return (
    <form className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2" onSubmit={openMail}>
      {fields.map((field) => (
        <label key={field.name} className={`block min-w-0 ${field.wide ? "col-span-2" : ""}`}>
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
            {field.label}
          </span>
          <input
            name={field.name}
            type={field.type}
            required
            autoComplete={field.name === "email" ? "email" : "off"}
            className="ledger-input py-2!"
          />
        </label>
      ))}
      <div className="col-span-2">
        <button
          type="submit"
          className="inline-flex max-w-full bg-ink px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-chart"
        >
          {button}
        </button>
      </div>
    </form>
  );
}
