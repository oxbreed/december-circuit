import { WpProbeControls } from "./wp-probe-controls";
import {
  getWpProbeSettings,
  listWpProbes,
  summarizeWpProbes,
  type WpProbeFilters,
} from "../wp-probes";

function param(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function formatTs(iso: string) {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Date(ms).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

export async function WpProbeSection({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const filters: WpProbeFilters = {
    path: param(searchParams.probe_path) || undefined,
    ip: param(searchParams.probe_ip) || undefined,
    from: param(searchParams.probe_from) || undefined,
    to: param(searchParams.probe_to) || undefined,
  };

  const settingsResult = await getWpProbeSettings();
  if (settingsResult.reason === "forbidden") return null;

  if (settingsResult.reason === "no-key") {
    return (
      <section className="mt-8">
        <h2 className="font-display text-3xl leading-none tracking-tight">WP probes</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Probe storage is not listed because the server key is not set.
        </p>
      </section>
    );
  }

  if (settingsResult.reason === "error") {
    return (
      <section className="mt-8">
        <h2 className="font-display text-3xl leading-none tracking-tight">WP probes</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Probe settings could not be read. Apply the `wp_probes` migration if it is not on the
          project yet.
        </p>
      </section>
    );
  }

  const [listed, summarized] = await Promise.all([
    listWpProbes(filters, 100),
    summarizeWpProbes(filters),
  ]);

  const exportQuery = new URLSearchParams();
  if (filters.path) exportQuery.set("path", filters.path);
  if (filters.ip) exportQuery.set("ip", filters.ip);
  if (filters.from) exportQuery.set("from", filters.from);
  if (filters.to) exportQuery.set("to", filters.to);
  const exportHref = `/api/wp-probes/export${exportQuery.toString() ? `?${exportQuery}` : ""}`;

  const settings = settingsResult.settings!;

  return (
    <section className="mt-8">
      <h2 className="font-display text-3xl leading-none tracking-tight">WP probes</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Scanner hits on WordPress-shaped paths. This is not a WordPress install — storage is for Ox
        Management only.
      </p>

      <WpProbeControls
        loggingEnabled={settings.logging_enabled}
        retentionDays={settings.retention_days}
      />

      <form method="get" className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Path</span>
          <input
            name="probe_path"
            defaultValue={param(searchParams.probe_path)}
            placeholder="/wp-login.php"
            className="ledger-input py-2!"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">IP</span>
          <input
            name="probe_ip"
            defaultValue={param(searchParams.probe_ip)}
            placeholder="1.2.3.4"
            className="ledger-input py-2!"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">From</span>
          <input
            name="probe_from"
            type="date"
            defaultValue={param(searchParams.probe_from)}
            className="ledger-input py-2!"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">To</span>
          <input
            name="probe_to"
            type="date"
            defaultValue={param(searchParams.probe_to)}
            className="ledger-input py-2!"
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button
            type="submit"
            className="inline-flex bg-ink px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-chart"
          >
            Filter
          </button>
          <a
            href="/admin"
            className="inline-flex border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ink"
          >
            Clear filters
          </a>
          <a
            href={exportHref}
            className="inline-flex border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ink"
          >
            Export CSV
          </a>
        </div>
      </form>

      {summarized.reason === "error" || listed.reason === "error" ? (
        <p className="mt-4 text-sm leading-7 text-muted">
          Probes could not be read. Apply the `wp_probes` migration if it is not on the project yet.
        </p>
      ) : summarized.reason !== "ok" || listed.reason !== "ok" ? (
        <p className="mt-4 text-sm leading-7 text-muted">Probes could not be read.</p>
      ) : (
        <>
          <div className="mt-4 grid gap-1 text-sm leading-6 text-ink">
            <p>
              {summarized.summary!.total} in view · {summarized.summary!.last24h} in the last 24h ·{" "}
              {summarized.summary!.distinctIps} distinct IPs
            </p>
            {summarized.summary!.topPaths.length > 0 ? (
              <p className="text-muted">
                Top paths:{" "}
                {summarized.summary!.topPaths
                  .map((row) => `${row.path} (${row.count})`)
                  .join(" · ")}
              </p>
            ) : null}
            {settings.retention_days !== null ? (
              <p className="text-muted">
                Auto-delete older than {settings.retention_days} days runs on ingest and when
                retention is saved.
              </p>
            ) : (
              <p className="text-muted">No retention period — rows stay until purged.</p>
            )}
          </div>

          {listed.rows.length === 0 ? (
            <p className="mt-4 text-sm leading-7 text-ink">No probes match these filters.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {listed.rows.map((row) => (
                <li
                  key={row.id}
                  className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    {row.method} · {formatTs(row.ts)}
                  </p>
                  <p className="break-all">{row.path}</p>
                  <p className="text-muted">
                    {[row.ip, row.host, row.ua].filter(Boolean).join(" · ") || "No IP / UA"}
                  </p>
                  {row.referer ? <p className="break-all text-muted">ref {row.referer}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export function WpProbeSectionFallback() {
  return (
    <section className="mt-8">
      <h2 className="font-display text-3xl leading-none tracking-tight">WP probes</h2>
      <p className="mt-3 text-sm leading-7 text-muted">Loading probes…</p>
    </section>
  );
}
