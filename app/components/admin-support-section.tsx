import Link from "next/link";
import { formatLondonStamp } from "../admin-format";
import { hrefForSection } from "../admin-routes";
import { setSupportRequestStatusAction } from "../admin-actions";
import {
  SUPPORT_MIGRATION_NEEDED,
  listSupportRequests,
  parseSupportTab,
  type SupportCounts,
  type SupportListTab,
  type SupportRequest,
} from "../support/requests";
import { supportTopicLabel, supportTopics } from "../support/topics";
import { ActionForm } from "./admin-ui";

function replyMailto(row: SupportRequest) {
  const subject = `Dirty December support: ${supportTopicLabel(row.topic)}`;
  const body = `Hello ${row.name},\n\nThank you for writing to Dirty December.\n\n`;
  return `mailto:${row.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function AdminSupportView({
  tab,
  topic,
  q,
  counts,
  rows,
  reason,
}: {
  tab: SupportListTab;
  topic?: string;
  q?: string;
  counts: SupportCounts;
  rows: SupportRequest[];
  reason: "ok" | "no-key" | "forbidden" | "needs-migration" | "error";
}) {
  const tabs: { id: SupportListTab; label: string; count?: number }[] = [
    { id: "open", label: "Open", count: counts.open },
    { id: "resolved", label: "Resolved", count: counts.resolved },
    { id: "all", label: "All", count: counts.open + counts.resolved },
  ];

  return (
    <section className="min-w-0" data-admin-panel="support">
      <h2 className="font-display text-3xl leading-none tracking-tight">Support</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Messages left through Ask support. Filter by status or topic, then reply
        by email or mark a request resolved. Chat questions are not stored here.
      </p>

      {reason === "needs-migration" ? (
        <p className="mt-4 border border-brass/40 bg-chart px-4 py-3 text-sm leading-7 text-ink">
          {SUPPORT_MIGRATION_NEEDED}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Support status">
        {tabs.map((item) => {
          const active = item.id === tab;
          return (
            <Link
              key={item.id}
              href={hrefForSection("support", {
                tab: item.id,
                ...(topic ? { topic } : {}),
                ...(q ? { q } : {}),
              })}
              className={`inline-flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-[0.16em] ${
                active ? "bg-ink text-chart" : "border border-ink/20 bg-chart text-ink hover:border-oxide"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
              {item.count != null ? <span>{item.count}</span> : null}
            </Link>
          );
        })}
      </div>

      <form action="/admin" method="get" className="mt-4 flex flex-wrap gap-3">
        <input type="hidden" name="section" value="support" />
        <input type="hidden" name="tab" value={tab} />
        <label className="min-w-[12rem] flex-1">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Search</span>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            className="ledger-input"
            placeholder="Name, email, message"
          />
        </label>
        <label>
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Topic</span>
          <select name="topic" defaultValue={topic ?? ""} className="ledger-input py-2!">
            <option value="">All topics</option>
            {supportTopics.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="self-end bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart">
          Filter
        </button>
      </form>

      {reason === "no-key" ? (
        <p className="mt-6 text-sm leading-7 text-muted">
          Support is unavailable because the server key is not set.
        </p>
      ) : reason === "forbidden" ? (
        <p className="mt-6 text-sm leading-7 text-muted">Access refused.</p>
      ) : reason === "error" ? (
        <p className="mt-6 text-sm leading-7 text-muted">Support messages could not be read.</p>
      ) : reason === "needs-migration" ? (
        <p className="mt-6 text-sm leading-7 text-muted">The inbox will appear after the database update is applied.</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm leading-7 text-ink">
          {tab === "open"
            ? "No open support messages are on file."
            : tab === "resolved"
              ? "No resolved support messages are on file."
              : "No support messages are on file."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {rows.map((row) => (
            <li key={row.id} className="border border-ink/15 bg-chart px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    {supportTopicLabel(row.topic)} · {row.status}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink">
                    {row.name} · {row.email}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    {formatLondonStamp(row.created_at)}
                    {row.page_path ? ` · ${row.page_path}` : ""}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                    row.status === "open" ? "border-oxide/40 text-oxide" : "border-lagoon/40 text-lagoon"
                  }`}
                >
                  {row.status}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">{row.message}</p>
              {row.resolved_by ? (
                <p className="mt-2 text-sm leading-6 text-muted">
                  Marked resolved by {row.resolved_by}
                  {row.resolved_at ? ` on ${formatLondonStamp(row.resolved_at)}` : ""}.
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={replyMailto(row)}
                  className="inline-flex border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-ink hover:border-oxide hover:text-oxide"
                >
                  Reply by email
                </a>
                <ActionForm action={setSupportRequestStatusAction} className="inline-flex">
                  <input type="hidden" name="id" value={row.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={row.status === "open" ? "resolved" : "open"}
                  />
                  <button
                    type="submit"
                    className="inline-flex border border-ink/20 bg-paper px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-ink hover:border-oxide hover:text-oxide"
                  >
                    {row.status === "open" ? "Mark resolved" : "Mark open"}
                  </button>
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export async function AdminSupportSection({
  tab: rawTab,
  topic,
  q,
}: {
  tab?: string | string[];
  topic?: string | string[];
  q?: string | string[];
}) {
  const tab = parseSupportTab(rawTab);
  const topicValue = Array.isArray(topic) ? topic[0] : topic;
  const qValue = Array.isArray(q) ? q[0] : q;
  const listed = await listSupportRequests({
    tab,
    topic: topicValue || undefined,
    q: qValue || undefined,
  });
  return (
    <AdminSupportView
      tab={tab}
      topic={topicValue}
      q={qValue}
      counts={listed.counts}
      rows={listed.rows}
      reason={listed.reason}
    />
  );
}
