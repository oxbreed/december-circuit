import type { Metadata } from "next";
import { fixtureApprovalCounts, fixtureApprovals, fixturePendingCount } from "../../admin-control-fixture";
import { ApprovalsView } from "../../components/admin-approvals-section";
import { AdminShell } from "../../components/admin-shell";

export const metadata: Metadata = {
  title: "Control panel preview",
  robots: { index: false, follow: false },
};

/** Visual QA only. Fixture data, no admin session required. */
export default function AdminControlPreviewPage() {
  return (
    <div data-preview="admin-control-panel">
      <p className="mx-auto max-w-6xl px-4 pt-6 text-[11px] uppercase tracking-[0.2em] text-muted sm:px-6">
        Preview · fixture data
      </p>
      <AdminShell
        email="dirtydecember411@gmail.com"
        section="approvals"
        pendingCount={fixturePendingCount}
        preview
      >
        <ApprovalsView
          tab="pending"
          counts={fixtureApprovalCounts}
          rows={fixtureApprovals}
          pictures={new Map()}
          reason="ok"
          needsReviewColumns={false}
        />
      </AdminShell>
    </div>
  );
}
