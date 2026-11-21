import type { Metadata } from "next";
import { AdminShell } from "../../components/admin-shell";
import { AdminSupportView } from "../../components/admin-support-section";
import { fixtureSupportCounts, fixtureSupportRequests } from "../../support-fixture";

export const metadata: Metadata = {
  title: "Support inbox preview",
  robots: { index: false, follow: false },
};

/** Visual QA only. Fixture messages, no admin session required. */
export default function AdminSupportPreviewPage() {
  return (
    <div data-preview="admin-support">
      <p className="mx-auto max-w-6xl px-4 pt-6 text-[11px] uppercase tracking-[0.2em] text-muted sm:px-6">
        Preview · fixture data
      </p>
      <AdminShell
        email="oxbreedmanagement@gmail.com"
        section="support"
        preview
        supportOpenCount={fixtureSupportCounts.open}
      >
        <AdminSupportView
          tab="open"
          counts={fixtureSupportCounts}
          rows={fixtureSupportRequests.filter((row) => row.status === "open")}
          reason="ok"
        />
      </AdminShell>
    </div>
  );
}
