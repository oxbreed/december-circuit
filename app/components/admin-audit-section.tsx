import { MIGRATION_NEEDED } from "../admin-guard";
import { listAdminAudit } from "../admin-audit";
import { formatLondonStamp } from "../admin-format";

export async function AdminAuditSection() {
  const listed = await listAdminAudit(120);
  return (
    <section className="min-w-0" data-admin-panel="audit">
      <h2 className="font-display text-3xl leading-none tracking-tight">Audit log</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        A record of approvals, publishes, hides, and other panel actions. Rows are written when an
        allowlisted admin completes an action.
      </p>
      {listed.reason === "needs-migration" ? (
        <p className="mt-4 border border-brass/40 bg-chart px-4 py-3 text-sm leading-7 text-ink">
          {MIGRATION_NEEDED}
        </p>
      ) : listed.reason === "no-key" ? (
        <p className="mt-4 text-sm leading-7 text-muted">The audit log is unavailable because the server key is not set.</p>
      ) : listed.reason === "error" ? (
        <p className="mt-4 text-sm leading-7 text-muted">The audit log could not be read.</p>
      ) : listed.rows.length === 0 ? (
        <p className="mt-4 text-sm leading-7 text-ink">No admin actions have been recorded yet.</p>
      ) : (
        <ol className="mt-6 grid gap-3">
          {listed.rows.map((row) => (
            <li key={row.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {row.action} · {formatLondonStamp(row.created_at)}
              </p>
              <p className="mt-1">{row.summary}</p>
              <p className="text-muted">
                {row.actor_email}
                {row.entity_id ? ` · ${row.entity_type} ${row.entity_id}` : ""}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
