import { summarizePageViews } from "../page-views";

const VERCEL_ANALYTICS_HELP =
  "https://vercel.com/docs/analytics";
const VERCEL_SPEED_HELP =
  "https://vercel.com/docs/speed-insights";

export async function SiteAnalyticsSection() {
  const result = await summarizePageViews();

  return (
    <section className="mt-8">
      <h2 className="font-display text-3xl leading-none tracking-tight">Site analytics</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Visits, countries, and Core Web Vitals live in the Vercel project dashboards. First-party
        path and country counts below are a privacy-light backup stored in Supabase (no visitor IP).
      </p>

      <ul className="mt-4 grid gap-2 text-sm leading-6 text-ink">
        <li>
          <a
            href="https://vercel.com/dashboard"
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            target="_blank"
            rel="noreferrer"
          >
            Open Vercel dashboard
          </a>
          {" — "}
          select the dirtydecember.info project, then{" "}
          <span className="text-muted">Analytics</span> (visits, pages, country, referrers) or{" "}
          <span className="text-muted">Speed Insights</span> (Core Web Vitals).
        </li>
        <li>
          Docs:{" "}
          <a
            href={VERCEL_ANALYTICS_HELP}
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            target="_blank"
            rel="noreferrer"
          >
            Web Analytics
          </a>
          {" · "}
          <a
            href={VERCEL_SPEED_HELP}
            className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            target="_blank"
            rel="noreferrer"
          >
            Speed Insights
          </a>
        </li>
      </ul>

      <h3 className="mt-6 font-display text-2xl leading-none tracking-tight">
        First-party visits
      </h3>

      {result.reason === "forbidden" ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          Visit storage opens only for the admin address held on the server.
        </p>
      ) : result.reason === "no-key" ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          First-party visits are not listed because the server key is not set. Vercel Analytics and
          Speed Insights still run from the root layout when enabled on the project.
        </p>
      ) : result.reason === "error" ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          First-party visits could not be read. Apply the `page_views` migration if it is not on the
          project yet (`supabase db push` or the SQL editor).
        </p>
      ) : result.reason === "empty" || result.summary?.total === 0 ? (
        <p className="mt-3 text-sm leading-7 text-ink">
          No first-party page views are on file yet. After the migration is applied and the site
          serves traffic, path and country counts appear here. Until then, use the Vercel Analytics
          Country panel.
        </p>
      ) : (
        <div className="mt-3 grid gap-3 text-sm leading-6 text-ink">
          <p>
            {result.summary!.total} stored (latest sample up to 5,000) · {result.summary!.last24h}{" "}
            in the last 24h · {result.summary!.last7d} in the last 7 days
          </p>
          {result.summary!.topPaths.length > 0 ? (
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Top paths</p>
              <ul className="mt-1 grid gap-1">
                {result.summary!.topPaths.map((row) => (
                  <li key={row.path} className="break-all">
                    {row.path}{" "}
                    <span className="text-muted">({row.count})</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {result.summary!.topCountries.length > 0 ? (
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Top countries</p>
              <ul className="mt-1 grid gap-1">
                {result.summary!.topCountries.map((row) => (
                  <li key={row.country}>
                    {row.country}{" "}
                    <span className="text-muted">({row.count})</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-muted">
              No country codes yet. On Vercel, country comes from `x-vercel-ip-country`. Locally it
              is often blank — use the Vercel Analytics Country panel for production geo.
            </p>
          )}
          <p className="text-muted">
            Rows auto-delete after about 90 days. Visitor IP addresses are not stored.
          </p>
        </div>
      )}
    </section>
  );
}

export function SiteAnalyticsSectionFallback() {
  return (
    <section className="mt-8">
      <h2 className="font-display text-3xl leading-none tracking-tight">Site analytics</h2>
      <p className="mt-3 text-sm leading-7 text-muted">Loading analytics…</p>
    </section>
  );
}
