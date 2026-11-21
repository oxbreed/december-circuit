import { partners } from "../affiliate-partners";
import { AdminContentSection } from "./admin-content-section";
import { listOutboundClicks } from "../outbound-clicks";
import { formatLondonStamp } from "../admin-format";

export async function AdminAffiliatesSection() {
  let clicks;
  try {
    clicks = await listOutboundClicks(120);
  } catch (error) {
    console.error("Admin affiliates clicks", error);
    clicks = { reason: "error" as const, rows: [] };
  }

  const totals = new Map<string, { count: number; earning: number }>();
  if (clicks.reason === "ok") {
    for (const row of clicks.rows) {
      const current = totals.get(row.partner) ?? { count: 0, earning: 0 };
      current.count += 1;
      if (row.earning) current.earning += 1;
      totals.set(row.partner, current);
    }
  }

  return (
    <section className="min-w-0" data-admin-panel="affiliates">
      <h2 className="font-display text-3xl leading-none tracking-tight">Affiliates</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Partner links, Get featured placements, and outbound click performance. Affiliate IDs stay
        in server environment variables. This panel does not paste them into pages.
      </p>

      <h3 className="mt-8 text-[11px] uppercase tracking-[0.18em] text-muted">Partners on file</h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {Object.values(partners).map((partner) => {
          const stats = totals.get(partner.slug);
          return (
            <li key={partner.slug} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{partner.kind}</p>
              <p className="mt-1">{partner.name}</p>
              <p className="text-muted">{partner.label}</p>
              <p className="text-muted">
                {stats
                  ? `${stats.count} recent clicks. ${stats.earning} marked as earning.`
                  : "No recent clicks in the last fetch."}
              </p>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-10 text-[11px] uppercase tracking-[0.18em] text-muted">Recent outbound clicks</h3>
      {clicks.reason === "no-key" ? (
        <p className="mt-3 text-sm leading-7 text-muted">Clicks are unavailable because the server key is not set.</p>
      ) : clicks.reason === "error" ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          Outbound clicks could not be read. If the table is still missing, apply the outbound_clicks
          migration.
        </p>
      ) : clicks.rows.length === 0 ? (
        <p className="mt-3 text-sm leading-7 text-ink">No outbound clicks are on file yet.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {clicks.rows.slice(0, 40).map((row) => (
            <li key={row.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {row.kind} · {formatLondonStamp(row.ts)}
              </p>
              <p>
                {row.partner}
                {row.target ? `: ${row.target}` : ""}
              </p>
              <p className="text-muted">
                {[row.placement, row.from_path, row.country, row.earning ? "earning" : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-12 border-t border-ink/10 pt-8">
        <AdminContentSection kind="placement" />
      </div>
    </section>
  );
}
