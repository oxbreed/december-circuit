import type { Metadata } from "next";
import {
  AdminSettingsView,
  currentAffiliateProviders,
} from "../../components/admin-settings-section";
import { AdminShell } from "../../components/admin-shell";
import { providerReports } from "../../providers";

export const metadata: Metadata = {
  title: "Settings preview",
  robots: { index: false, follow: false },
};

/** Visual QA only. Fixture probe settings, no admin session required. */
export default function AdminSettingsPreviewPage() {
  return (
    <div data-preview="admin-settings">
      <p className="mx-auto max-w-6xl px-4 pt-6 text-[11px] uppercase tracking-[0.2em] text-muted sm:px-6">
        Preview · fixture data
      </p>
      <AdminShell email="oxbreedmanagement@gmail.com" section="settings" preview>
        <AdminSettingsView
          auth={{
            connected: true,
            adminEmails: ["oxbreedmanagement@gmail.com"],
          }}
          pageviewsOn={true}
          gaOn={false}
          providers={providerReports()}
          affiliateProviders={currentAffiliateProviders()}
          probes={{ status: "ok", loggingEnabled: true, retentionDays: 30 }}
        />
      </AdminShell>
    </div>
  );
}
