import { WpProbeControls } from "./wp-probe-controls";
import { providerReports } from "../providers";
import { getWpProbeSettings } from "../wp-probes";

function flagOn(raw: string | undefined, defaultOn: boolean) {
  if (raw === undefined || raw === "") return defaultOn;
  const v = raw.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off" || v === "no") return false;
  if (v === "1" || v === "true" || v === "on" || v === "yes") return true;
  return defaultOn;
}

export async function AdminSettingsSection() {
  const settingsResult = await getWpProbeSettings();
  const providers = providerReports();
  const pageviewsOn = flagOn(process.env.SITE_PAGEVIEWS_ENABLED, true);
  const gaId = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();

  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Settings</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Retention, probe storage, and analytics switches already wired for this site — grouped here
        for Ox Management.
      </p>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">Probe storage</h3>
        <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
          Controls whether WordPress-shaped scanner hits are stored in Supabase. Stdout `wp_probe`
          lines still write either way.
        </p>
        {settingsResult.reason === "no-key" ? (
          <p className="mt-3 text-sm leading-7 text-muted">
            Probe settings are unavailable because the server key is not set.
          </p>
        ) : settingsResult.reason === "error" || settingsResult.reason === "forbidden" ? (
          <p className="mt-3 text-sm leading-7 text-muted">
            Probe settings could not be read. Apply the `wp_probes` migration if it is not on the
            project yet.
          </p>
        ) : (
          <WpProbeControls
            loggingEnabled={settingsResult.settings!.logging_enabled}
            retentionDays={settingsResult.settings!.retention_days}
          />
        )}
      </div>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">Analytics</h3>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink">
          <li>
            First-party page views + Web Vitals:{" "}
            <span className={pageviewsOn ? "text-lagoon" : "text-oxide"}>
              {pageviewsOn ? "on" : "off"}
            </span>
            <span className="text-muted">
              {" "}
              (`SITE_PAGEVIEWS_ENABLED` on the server; default on when unset)
            </span>
          </li>
          <li>
            Google Analytics:{" "}
            <span className={gaId ? "text-lagoon" : "text-muted"}>
              {gaId ? `configured (${gaId})` : "off"}
            </span>
            <span className="text-muted">
              {" "}
              (`NEXT_PUBLIC_GA_MEASUREMENT_ID`; leave empty unless deliberately enabled)
            </span>
          </li>
          <li className="text-muted">
            Change these with Vercel env vars and redeploy — there is no in-panel writer for them.
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <a
            href="https://vercel.com/dashboard"
            className="text-muted underline decoration-ink/25 underline-offset-4 hover:text-oxide"
            target="_blank"
            rel="noreferrer"
          >
            Vercel Analytics
          </a>
          <a
            href="https://vercel.com/dashboard"
            className="text-muted underline decoration-ink/25 underline-offset-4 hover:text-oxide"
            target="_blank"
            rel="noreferrer"
          >
            Vercel Speed Insights
          </a>
        </div>
      </div>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">Providers</h3>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink">
          {providers.map((provider) => (
            <li key={provider.name}>
              {provider.name}: {provider.detail}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AdminSettingsSectionFallback() {
  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Settings</h2>
      <p className="mt-3 text-sm leading-7 text-muted">Loading settings…</p>
    </section>
  );
}
