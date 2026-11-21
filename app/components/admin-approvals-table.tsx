"use client";

import { useMemo, useState } from "react";
import { approveSubmissions, rejectSubmissions } from "../admin-actions";
import { approvalTitle, type ApprovalRow, type ApprovalTab } from "../admin-approvals-types";
import { formatLondonStamp } from "../admin-format";
import { ActionForm } from "./admin-ui";

export function ApprovalsTable({
  rows,
  pictures,
  tab,
  canMutate,
}: {
  rows: ApprovalRow[];
  pictures: Record<string, string | null>;
  tab: ApprovalTab;
  canMutate: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const ids = useMemo(() => rows.map((row) => row.id), [rows]);
  const allOn = ids.length > 0 && ids.every((id) => selected.includes(id));

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="min-w-0">
      {canMutate && tab === "pending" ? (
        <div className="mb-4 flex flex-wrap items-end gap-3 border border-ink/15 bg-chart px-4 py-3">
          <label className="flex items-center gap-2 text-sm leading-6">
            <input
              type="checkbox"
              checked={allOn}
              onChange={() => setSelected(allOn ? [] : ids)}
            />
            Select all
          </label>
          <ActionForm action={approveSubmissions} className="flex flex-wrap items-end gap-3">
            {selected.map((id) => (
              <input key={`s-a-${id}`} type="hidden" name="ids" value={id} />
            ))}
            <label>
              <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Note</span>
              <input type="text" name="review_note" className="ledger-input min-w-[10rem]" />
            </label>
            <button
              type="submit"
              disabled={selected.length === 0}
              className="bg-lagoon px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-40"
            >
              Approve selected
            </button>
          </ActionForm>
          <ActionForm action={rejectSubmissions} className="flex flex-wrap items-end gap-3">
            {selected.map((id) => (
              <input key={`s-r-${id}`} type="hidden" name="ids" value={id} />
            ))}
            <label>
              <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Note</span>
              <input type="text" name="review_note" className="ledger-input min-w-[10rem]" />
            </label>
            <button
              type="submit"
              disabled={selected.length === 0}
              className="bg-oxide px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-40"
            >
              Reject selected
            </button>
          </ActionForm>
        </div>
      ) : null}

      <ul className="grid gap-3">
        {rows.map((row) => (
          <li key={row.id} className="border border-ink/15 bg-chart px-4 py-4 text-sm leading-6 text-ink">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                {canMutate && tab === "pending" ? (
                  <label className="mb-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggle(row.id)}
                    />
                    Select
                  </label>
                ) : null}
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  {row.kind}
                  {row.created_at ? ` · ${formatLondonStamp(row.created_at)}` : ""}
                </p>
                <p className="mt-1 font-medium">{approvalTitle(row)}</p>
                <p className="text-muted">
                  {[row.city, row.dates, row.venue, row.category, row.offer].filter(Boolean).join(" · ")}
                </p>
                <p>{row.sender_email}</p>
                {row.public_link ? (
                  <a
                    href={row.public_link}
                    className="break-all underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                  >
                    {row.public_link}
                  </a>
                ) : null}
                {row.note ? <p className="mt-2 text-muted">Submitter note: {row.note}</p> : null}
                {row.review_note ? (
                  <p className="mt-2 text-muted">
                    Review note: {row.review_note}
                    {row.reviewed_by ? ` (${row.reviewed_by})` : ""}
                  </p>
                ) : null}
                {row.published_slug ? (
                  <p className="mt-1 text-muted">Public slug: {row.published_slug}</p>
                ) : null}
                {pictures[row.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pictures[row.id] ?? ""}
                    alt="Submission picture"
                    className="mt-3 max-h-48 max-w-full object-contain"
                  />
                ) : row.image_path || row.image_unreadable ? (
                  <p className="mt-2 text-muted">A picture is on file but could not be shown.</p>
                ) : null}
              </div>
            </div>

            {canMutate && tab === "pending" ? (
              <div className="mt-4 grid gap-4 border-t border-ink/10 pt-4 lg:grid-cols-2">
                <ActionForm action={approveSubmissions} className="grid gap-3">
                  <input type="hidden" name="id" value={row.id} />
                  <EditFields row={row} />
                  <label>
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
                      Review note
                    </span>
                    <input type="text" name="review_note" className="ledger-input" />
                  </label>
                  <button type="submit" className="bg-lagoon px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart">
                    Approve and publish
                  </button>
                </ActionForm>
                <ActionForm action={rejectSubmissions} className="grid gap-3">
                  <input type="hidden" name="id" value={row.id} />
                  <label>
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
                      Review note
                    </span>
                    <input type="text" name="review_note" className="ledger-input" />
                  </label>
                  <button type="submit" className="bg-oxide px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart">
                    Reject
                  </button>
                </ActionForm>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditFields({ row }: { row: ApprovalRow }) {
  return (
    <details>
      <summary className="cursor-pointer text-[11px] uppercase tracking-[0.16em] text-muted">
        Edit before approve
      </summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {row.kind === "event" ? (
          <>
            <Field name="event_name" label="Event name" defaultValue={row.event_name} />
            <Field name="city" label="City or region" defaultValue={row.city} />
            <Field name="dates" label="Dates" defaultValue={row.dates} />
            <Field name="venue" label="Venue" defaultValue={row.venue} />
          </>
        ) : (
          <>
            <Field name="business_name" label="Name" defaultValue={row.business_name} />
            <Field name="city" label="City" defaultValue={row.city} />
            <Field name="category" label="Category" defaultValue={row.category} />
            <Field name="offer" label="Offer" defaultValue={row.offer} />
          </>
        )}
        <Field name="public_link" label="Source URL" defaultValue={row.public_link} />
      </div>
    </details>
  );
}

function Field({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string | null;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">{label}</span>
      <input type="text" name={name} defaultValue={defaultValue ?? ""} className="ledger-input" />
    </label>
  );
}
