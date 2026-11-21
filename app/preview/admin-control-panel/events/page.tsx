import type { Metadata } from "next";
import { fixtureEntries, fixturePendingCount } from "../../../admin-control-fixture";
import { ContentView } from "../../../components/admin-content-section";
import { AdminShell } from "../../../components/admin-shell";

export const metadata: Metadata = {
  title: "Control panel events preview",
  robots: { index: false, follow: false },
};

export default function AdminEventsPreviewPage() {
  return (
    <div data-preview="admin-control-events">
      <p className="mx-auto max-w-6xl px-4 pt-6 text-[11px] uppercase tracking-[0.2em] text-muted sm:px-6">
        Preview · fixture data
      </p>
      <AdminShell
        email="dirtydecember411@gmail.com"
        section="events"
        pendingCount={fixturePendingCount}
        preview
      >
        <ContentView kind="event" entries={fixtureEntries} reason="ok" />
      </AdminShell>
    </div>
  );
}
