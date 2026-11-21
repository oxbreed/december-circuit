import Link from "next/link";
import { approvalCounts, listApprovals, approvalTitle } from "../admin-approvals";
import { listSupportRequests } from "../support/requests";
import { listAdminAudit } from "../admin-audit";
import { eventRowsForAdmin, placeRowsForAdmin } from "./admin-directory-data";
import { AdminOverviewSection } from "./admin-directory-sections";
import { hrefForSection } from "../admin-routes";
import { formatLondonStamp } from "../admin-format";

export async function AdminHomeSection() {
  const [counts, pending, audit, support] = await Promise.all([
    approvalCounts(),
    listApprovals({ tab: "pending" }),
    listAdminAudit(6),
    listSupportRequests({ tab: "open" }),
  ]);
  let eventCount = 0;
  let placeCount = 0;
  try {
    eventCount = eventRowsForAdmin().length;
    placeCount = placeRowsForAdmin().length;
  } catch (error) {
    console.error("Admin home counts", error);
  }

  return (
    <div className="min-w-0">
      <section className="min-w-0" data-admin-panel="overview">
        <h2 className="font-display text-3xl leading-none tracking-tight">Overview</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
          A snapshot of the directory and the work waiting in Approvals and Support.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <HomeStat
            label="Pending approvals"
            value={String(counts.counts.pending)}
            href={hrefForSection("approvals")}
          />
          <HomeStat
            label="Open support"
            value={String(support.counts.open)}
            href={hrefForSection("support")}
          />
          <HomeStat label="Events on file" value={String(eventCount)} href={hrefForSection("events")} />
          <HomeStat label="Places on file" value={String(placeCount)} href={hrefForSection("places")} />
          <HomeStat
            label="Approved intake"
            value={String(counts.counts.approved)}
            href={hrefForSection("approvals", { tab: "approved" })}
          />
        </ul>

        <h3 className="mt-8 text-[11px] uppercase tracking-[0.18em] text-muted">Quick actions</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {[
            ["approvals", "Review approvals"],
            ["support", "Open support inbox"],
            ["events", "Add or edit an event"],
            ["places", "Add or edit a place"],
            ["affiliates", "Check partner clicks"],
            ["dashboard", "Open Insights"],
            ["audit", "Read the audit log"],
          ].map(([id, label]) => (
            <li key={id}>
              <Link
                href={hrefForSection(id as "approvals")}
                className="inline-flex border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-ink hover:border-oxide hover:text-oxide"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          <div className="border border-ink/15 bg-chart px-4 py-4">
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">Waiting on a decision</h3>
            {pending.reason !== "ok" ? (
              <p className="mt-3 text-sm leading-7 text-muted">The inbox could not be read.</p>
            ) : pending.rows.length === 0 ? (
              <p className="mt-3 text-sm leading-7 text-muted">No submissions are waiting.</p>
            ) : (
              <ul className="mt-3 grid gap-2 text-sm leading-6">
                {pending.rows.slice(0, 6).map((row) => (
                  <li key={row.id}>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-muted">{row.kind} · </span>
                    {approvalTitle(row)}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3">
              <Link
                href={hrefForSection("approvals")}
                className="text-sm underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                Open Approvals
              </Link>
            </p>
          </div>
          <div className="border border-ink/15 bg-chart px-4 py-4">
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">Recent admin actions</h3>
            {audit.reason === "needs-migration" ? (
              <p className="mt-3 text-sm leading-7 text-muted">
                The audit log will appear after the control panel database update is applied.
              </p>
            ) : audit.reason !== "ok" ? (
              <p className="mt-3 text-sm leading-7 text-muted">The audit log could not be read.</p>
            ) : audit.rows.length === 0 ? (
              <p className="mt-3 text-sm leading-7 text-muted">No admin actions recorded yet.</p>
            ) : (
              <ol className="mt-3 grid gap-2 text-sm leading-6">
                {audit.rows.map((row) => (
                  <li key={row.id}>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                      {formatLondonStamp(row.created_at)}
                    </p>
                    <p>{row.summary}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      <div className="mt-12 border-t border-ink/10 pt-8">
        <AdminOverviewSection />
      </div>
    </div>
  );
}

function HomeStat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <li className="border border-ink/15 bg-chart px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl leading-none tracking-tight tabular-nums">{value}</p>
      <p className="mt-2">
        <Link href={href} className="text-sm underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Open
        </Link>
      </p>
    </li>
  );
}
