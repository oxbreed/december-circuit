import type { Metadata } from "next";
import { fixturePendingCount } from "../../../admin-control-fixture";
import { AdminShell } from "../../../components/admin-shell";

export const metadata: Metadata = {
  title: "Control panel overview preview",
  robots: { index: false, follow: false },
};

export default function AdminOverviewPreviewPage() {
  return (
    <div data-preview="admin-control-overview">
      <p className="mx-auto max-w-6xl px-4 pt-6 text-[11px] uppercase tracking-[0.2em] text-muted sm:px-6">
        Preview · fixture data
      </p>
      <AdminShell
        email="dirtydecember411@gmail.com"
        section="overview"
        pendingCount={fixturePendingCount}
        preview
      >
        <section className="min-w-0">
          <h2 className="font-display text-3xl leading-none tracking-tight">Overview</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            A snapshot of the directory and the work waiting in Approvals. These figures are fixture
            data for visual review.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <li className="border border-ink/15 bg-chart px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Pending approvals</p>
              <p className="mt-2 font-display text-3xl leading-none tracking-tight tabular-nums">3</p>
            </li>
            <li className="border border-ink/15 bg-chart px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Events on file</p>
              <p className="mt-2 font-display text-3xl leading-none tracking-tight tabular-nums">86</p>
            </li>
            <li className="border border-ink/15 bg-chart px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Places on file</p>
              <p className="mt-2 font-display text-3xl leading-none tracking-tight tabular-nums">240</p>
            </li>
            <li className="border border-ink/15 bg-chart px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Approved intake</p>
              <p className="mt-2 font-display text-3xl leading-none tracking-tight tabular-nums">1</p>
            </li>
          </ul>
        </section>
      </AdminShell>
    </div>
  );
}
