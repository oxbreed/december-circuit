import type { ReactNode } from "react";
import { connection } from "next/server";
import { WpProbeControls } from "./wp-probe-controls";
import { partnerEarning } from "../affiliate-config";
import { directorySignIn } from "../directory-auth";
import { providerReports, type ProviderReport } from "../providers";
import { getWpProbeSettings } from "../wp-probes";
import { resolveGaMeasurementId } from "../ga-measurement-id";

function flagOn(raw: string | undefined, defaultOn: boolean) {
  if (raw === undefined || raw === "") return defaultOn;
  const v = raw.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off" || v === "no") return false;
  if (v === "1" || v === "true" || v === "on" || v === "yes") return true;
  return defaultOn;
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "on" | "off";
  children: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
        tone === "on" ? "border-lagoon/40 text-lagoon" : "border-ink/15 text-muted"
      }`}
    >
      {children}
    </span>
  );
}

function EnvNames({ names }: { names: readonly string[] }) {
  return (
    <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
      {names.map((name) => (
        <code key={name} className="font-mono text-[11px] text-muted">
          {name}
        </code>
      ))}
    </p>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-ink/15 bg-chart px-5 py-5 sm:px-6 sm:py-6">
      <h3 className="font-display text-2xl leading-none tracking-tight">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-xl text-sm leading-7 text-muted">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SettingsRow({
  label,
  env,
  badge,
  detail,
}: {
  label: string;
  env?: readonly string[];
  badge: { tone: "on" | "off"; text: string };
  detail?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-t border-ink/10 py-3 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm leading-6 text-ink">{label}</p>
        {env ? <EnvNames names={env} /> : null}
        {detail ? <p className="mt-1 text-sm leading-6 text-muted">{detail}</p> : null}
      </div>
      <StatusBadge tone={badge.tone}>{badge.text}</StatusBadge>
    </div>
  );
}

export type AffiliateProviderRow = {
  name: string;
  earning: boolean;
  env: readonly string[];
};

export type ProbeSettingsView =
  | { status: "ok"; loggingEnabled: boolean; retentionDays: number | null }
  | { status: "no-key" }
  | { status: "error" };

export type AdminSettingsViewProps = {
  auth: { connected: boolean; adminEmails: string[] };
  pageviewsOn: boolean;
  gaOn: boolean;
  providers: ProviderReport[];
  affiliateProviders: AffiliateProviderRow[];
  probes: ProbeSettingsView;
};

export function currentAffiliateProviders(): AffiliateProviderRow[] {
  return [
    {
      name: "Trip.com",
      earning: partnerEarning("tripcom-hotels") || partnerEarning("tripcom-flights"),
      env: ["TRIPCOM_ALLIANCE_ID", "TRIPCOM_SID"],
    },
    { name: "Agoda", earning: partnerEarning("agoda"), env: ["AGODA_CID"] },
    { name: "Booking.com", earning: partnerEarning("booking"), env: ["BOOKING_CJ_PID", "BOOKING_CJ_LINK_ID", "BOOKING_AID"] },
    { name: "Viator", earning: partnerEarning("viator"), env: ["VIATOR_PID", "VIATOR_MCID"] },
  ];
}

export function AdminSettingsView({
  auth,
  pageviewsOn,
  gaOn,
  providers,
  affiliateProviders,
  probes,
}: AdminSettingsViewProps) {
  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Settings</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Sign-in, probe storage, analytics, and provider connections for this site.
      </p>

      <div className="mt-8 grid gap-4">
        <SettingsCard
          title="Sign-in"
          description="Operators sign in with an email link through Supabase Auth."
        >
          <SettingsRow
            label="Supabase Auth"
            badge={
              auth.connected
                ? { tone: "on", text: "Connected" }
                : { tone: "off", text: "Not connected" }
            }
          />
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-t border-ink/10 py-3">
            <div className="min-w-0">
              <p className="text-sm leading-6 text-ink">Admin allowlist</p>
              <EnvNames names={["ADMIN_EMAILS"]} />
              {auth.adminEmails.length ? (
                <ul className="mt-2 grid gap-1">
                  {auth.adminEmails.map((email) => (
                    <li key={email} className="font-mono text-[13px] leading-6 text-ink">
                      {email}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm leading-6 text-muted">No addresses on file.</p>
              )}
              <p className="mt-2 text-sm leading-6 text-muted">
                Set <code className="font-mono text-[11px]">ADMIN_EMAILS</code> on Vercel if you
                need more than the default address. The steps are in{" "}
                <code className="font-mono text-[11px]">docs/auth-admin-setup.md</code>.
              </p>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Probe storage"
          description="Controls whether WordPress-shaped scanner hits are stored in Supabase."
        >
          {probes.status === "no-key" ? (
            <p className="text-sm leading-7 text-muted">
              Probe settings are unavailable because the server key is not set.
            </p>
          ) : probes.status === "error" ? (
            <p className="text-sm leading-7 text-muted">
              Probe settings could not be read. Apply the{" "}
              <code className="font-mono text-[11px]">wp_probes</code> migration if it is not on
              the project yet.
            </p>
          ) : (
            <WpProbeControls
              loggingEnabled={probes.loggingEnabled}
              retentionDays={probes.retentionDays}
            />
          )}
        </SettingsCard>

        <SettingsCard
          title="Analytics"
          description="First-party and third-party analytics for this site."
        >
          <SettingsRow
            label="First-party page views and Web Vitals"
            env={["SITE_PAGEVIEWS_ENABLED"]}
            badge={pageviewsOn ? { tone: "on", text: "On" } : { tone: "off", text: "Off" }}
            detail="On by default when the variable is unset."
          />
          <SettingsRow
            label="Google Analytics"
            env={["NEXT_PUBLIC_GA_MEASUREMENT_ID"]}
            badge={gaOn ? { tone: "on", text: "On" } : { tone: "off", text: "Off" }}
            detail="On in production with the built-in Dirty December measurement ID. Set NEXT_PUBLIC_GA_MEASUREMENT_ID to override, or to off to disable."
          />
          <p className="border-t border-ink/10 pt-3 text-sm leading-6 text-muted">
            Change these with Vercel env vars and redeploy. There is no in-panel writer for them.
          </p>
          <ul className="mt-3 grid gap-2">
            <li className="border border-ink/10 px-4 py-3">
              <a
                href="https://vercel.com/dashboard"
                className="block text-sm leading-6 text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel Analytics
                <span className="sr-only"> (leaves this site)</span>
              </a>
              <p className="mt-1 font-mono text-[11px] text-muted">vercel.com/dashboard</p>
            </li>
            <li className="border border-ink/10 px-4 py-3">
              <a
                href="https://vercel.com/dashboard"
                className="block text-sm leading-6 text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel Speed Insights
                <span className="sr-only"> (leaves this site)</span>
              </a>
              <p className="mt-1 font-mono text-[11px] text-muted">vercel.com/dashboard</p>
            </li>
          </ul>
        </SettingsCard>

        <SettingsCard
          title="Providers"
          description="Event source keys and travel partner programmes used on this site."
        >
          <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-muted">Event sources</p>
          {providers.map((provider) => {
            const hasKey = provider.detail !== "not connected";
            return (
              <SettingsRow
                key={provider.name}
                label={provider.name}
                env={[provider.env]}
                badge={
                  hasKey
                    ? { tone: "off", text: "Key set" }
                    : { tone: "off", text: "Not connected" }
                }
                detail={hasKey ? provider.detail : undefined}
              />
            );
          })}
          <p className="mb-1 mt-4 text-[10px] uppercase tracking-[0.16em] text-muted">
            Travel partners
          </p>
          {affiliateProviders.map((provider) => (
            <SettingsRow
              key={provider.name}
              label={provider.name}
              env={provider.env}
              badge={
                provider.earning
                  ? { tone: "on", text: "On" }
                  : { tone: "off", text: "Not connected" }
              }
            />
          ))}
        </SettingsCard>
      </div>
    </section>
  );
}

export async function AdminSettingsSection() {
  await connection();
  const settingsResult = await getWpProbeSettings();
  const probes: ProbeSettingsView =
    settingsResult.reason === "no-key"
      ? { status: "no-key" }
      : settingsResult.reason === "error" || settingsResult.reason === "forbidden"
        ? { status: "error" }
        : {
            status: "ok",
            loggingEnabled: settingsResult.settings!.logging_enabled,
            retentionDays: settingsResult.settings!.retention_days,
          };

  return (
    <AdminSettingsView
      auth={directorySignIn()}
      pageviewsOn={flagOn(process.env.SITE_PAGEVIEWS_ENABLED, true)}
      gaOn={Boolean(resolveGaMeasurementId())}
      providers={providerReports()}
      affiliateProviders={currentAffiliateProviders()}
      probes={probes}
    />
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
