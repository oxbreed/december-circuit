import Link from "next/link";
import { MIGRATION_NEEDED } from "../admin-guard";
import {
  approvalCounts,
  approvalTitle,
  listApprovals,
  parseApprovalTab,
  type ApprovalCounts,
  type ApprovalRow,
  type ApprovalTab,
} from "../admin-approvals";
import { approveSubmissions, rejectSubmissions } from "../admin-actions";
import { signSubmissionPictures } from "../reviews";
import { hrefForSection } from "../admin-routes";
import { ActionForm } from "./admin-ui";
import { ApprovalsTable } from "./admin-approvals-table";

const kinds = [
  "event",
  "place",
  "business",
  "placement",
  "product",
  "booking",
  "transportation",
];

export function ApprovalsView({
  tab,
  kind,
  q,
  counts,
  rows,
  pictures,
  reason,
  needsReviewColumns,
}: {
  tab: ApprovalTab;
  kind?: string;
  q?: string;
  counts: ApprovalCounts;
  rows: ApprovalRow[];
  pictures: Map<string, string | null>;
  reason: "ok" | "no-key" | "forbidden" | "error";
  needsReviewColumns: boolean;
}) {
  const tabs: { id: ApprovalTab; label: string; count: number }[] = [
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "approved", label: "Approved", count: counts.approved },
    { id: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <section className="min-w-0" data-admin-panel="approvals">
      <h2 className="font-display text-3xl leading-none tracking-tight">Approvals</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Inbox for Get featured, event, place, and other listings sent in through the site. Approve
        to publish onto the public directory. Reject to keep a row off the site. A short note is
        optional.
      </p>

      {needsReviewColumns ? (
        <p className="mt-4 border border-brass/40 bg-chart px-4 py-3 text-sm leading-7 text-ink">
          {MIGRATION_NEEDED}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Approval status">
        {tabs.map((item) => {
          const active = item.id === tab;
          return (
            <Link
              key={item.id}
              href={hrefForSection("approvals", {
                tab: item.id,
                ...(kind ? { kind } : {}),
                ...(q ? { q } : {}),
              })}
              className={`inline-flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.16em] ${
                active ? "bg-ink text-chart" : "border border-ink/20 bg-chart text-ink hover:border-oxide"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
              <span>{item.count}</span>
            </Link>
          );
        })}
      </div>

      <form action="/admin" method="get" className="mt-4 flex flex-wrap gap-3">
        <input type="hidden" name="section" value="approvals" />
        <input type="hidden" name="tab" value={tab} />
        <label className="min-w-[12rem] flex-1">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Search</span>
          <input type="search" name="q" defaultValue={q ?? ""} className="ledger-input" placeholder="Name, city, email" />
        </label>
        <label>
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Kind</span>
          <select name="kind" defaultValue={kind ?? ""} className="ledger-input py-2!">
            <option value="">All kinds</option>
            {kinds.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="self-end bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart">
          Filter
        </button>
      </form>

      {reason === "no-key" ? (
        <p className="mt-6 text-sm leading-7 text-muted">Approvals are unavailable because the server key is not set.</p>
      ) : reason === "error" ? (
        <p className="mt-6 text-sm leading-7 text-muted">Approvals could not be read.</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm leading-7 text-ink">
          {tab === "pending"
            ? "No pending submissions. New intake from /list and /get-featured will land here."
            : `No ${tab} submissions in this filter.`}
        </p>
      ) : (
        <div className="mt-6">
          {tab === "pending" && !needsReviewColumns ? (
            <div className="mb-4 flex flex-wrap gap-4">
              <ActionForm action={approveSubmissions} className="flex flex-wrap items-end gap-3">
                {rows.map((row) => (
                  <input key={`bulk-a-${row.id}`} type="hidden" name="ids" value={row.id} />
                ))}
                <label>
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
                    Note for all
                  </span>
                  <input type="text" name="review_note" className="ledger-input min-w-[12rem]" />
                </label>
                <button type="submit" className="bg-lagoon px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart">
                  Approve all in this list
                </button>
              </ActionForm>
              <ActionForm action={rejectSubmissions} className="flex flex-wrap items-end gap-3">
                {rows.map((row) => (
                  <input key={`bulk-r-${row.id}`} type="hidden" name="ids" value={row.id} />
                ))}
                <label>
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
                    Note for all
                  </span>
                  <input type="text" name="review_note" className="ledger-input min-w-[12rem]" />
                </label>
                <button type="submit" className="bg-oxide px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart">
                  Reject all in this list
                </button>
              </ActionForm>
            </div>
          ) : null}
          <ApprovalsTable
            rows={rows}
            pictures={Object.fromEntries(pictures)}
            tab={tab}
            canMutate={!needsReviewColumns}
          />
        </div>
      )}
    </section>
  );
}

export async function AdminApprovalsSection({
  tab: rawTab,
  kind,
  q,
}: {
  tab?: string | string[];
  kind?: string | string[];
  q?: string | string[];
}) {
  const tab = parseApprovalTab(rawTab);
  const kindValue = Array.isArray(kind) ? kind[0] : kind;
  const qValue = Array.isArray(q) ? q[0] : q;
  const [counts, list] = await Promise.all([
    approvalCounts(),
    listApprovals({ tab, kind: kindValue || undefined, q: qValue || undefined }),
  ]);
  const pictures =
    list.reason === "ok" ? await signSubmissionPictures(list.rows) : new Map<string, string | null>();
  return (
    <ApprovalsView
      tab={tab}
      kind={kindValue}
      q={qValue}
      counts={counts.counts}
      rows={list.rows}
      pictures={pictures}
      reason={list.reason}
      needsReviewColumns={list.needsReviewColumns}
    />
  );
}

