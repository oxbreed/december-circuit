import type { Metadata } from "next";
import { adminDashboardFixture } from "../../admin-dashboard-fixture";
import { AdminDashboardView } from "../../components/admin-dashboard-section";

export const metadata: Metadata = {
  title: "Dashboard / Insights preview",
  robots: { index: false, follow: false },
};

/** Visual QA only. Fixture data so the dashboard can be reviewed without an admin session. */
export default function AdminDashboardPreviewPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Preview · fixture data</p>
      <div className="mt-6">
        <AdminDashboardView report={adminDashboardFixture()} />
      </div>
    </main>
  );
}
