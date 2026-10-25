import type { Metadata } from "next";
import { AnalyticsOverview } from "../../components/analytics-overview";
import { analyticsOverviewFixture } from "../../analytics-overview-fixture";

export const metadata: Metadata = {
  title: "Analytics Overview preview",
  robots: { index: false, follow: false },
};

/** Visual QA only — fixture data so Sessions/Pageviews + chart can be screenshotted without auth. */
export default function AnalyticsOverviewPreviewPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Preview · fixture data</p>
      <h1 className="mt-2 font-display text-3xl leading-none tracking-tight">Analytics</h1>
      <AnalyticsOverview summary={analyticsOverviewFixture()} />
    </main>
  );
}
