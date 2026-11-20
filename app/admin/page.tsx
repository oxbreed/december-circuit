import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import {
  AdminOutboundClicksSection,
  AdminEventsSection,
  AdminFeaturedSection,
  AdminGetFeaturedSection,
  AdminOverviewSection,
  AdminPlacesSection,
} from "../components/admin-directory-sections";
import {
  AdminSettingsSection,
  AdminSettingsSectionFallback,
} from "../components/admin-settings-section";
import { AdminShell, parseAdminSection } from "../components/admin-shell";
import {
  SiteAnalyticsSection,
  SiteAnalyticsSectionFallback,
} from "../components/site-analytics-section";
import { WpProbeSection, WpProbeSectionFallback } from "../components/wp-probe-section";
import { directorySignIn, isAdminEmail } from "../directory-auth";
import { listPublicReviews, listUnpublishedSubmissions, signSubmissionPictures } from "../reviews";
import { PICTURE_SHOW_MESSAGE } from "../submission-picture";
import { pageMetadata } from "../site";
import { getDirectoryUser } from "../supabase/session";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Ox Management",
    description: "Control of the records on file stays closed until an admin is signed in.",
    path: "/admin",
  }),
  robots: { index: false, follow: false },
};

function submissionLine(row: {
  kind: string;
  sender_email: string;
  event_name: string | null;
  city: string | null;
  dates: string | null;
  venue: string | null;
  product_name: string | null;
  business_name: string | null;
  offer: string | null;
  category: string | null;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  public_link: string | null;
}) {
  if (row.kind === "event") {
    return `${row.event_name}, ${row.city}, ${row.dates}, ${row.venue}`;
  }
  if (row.kind === "product") {
    return `${row.product_name}, ${row.business_name}`;
  }
  if (row.kind === "placement") return row.business_name ?? "";
  if (row.kind === "place" || row.kind === "business") {
    const parts = [
      row.business_name,
      row.city,
      row.category,
      row.note,
      row.latitude !== null && row.longitude !== null
        ? `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`
        : null,
    ].filter(Boolean);
    return parts.join(" · ");
  }
  return `${row.business_name}. ${row.offer}`;
}

function AccessRefused({ detail }: { detail: string }) {
  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Ox Management</p>
      <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        DirtyDecember
      </h1>
      <p className="mt-6 text-base leading-7 text-ink">Access refused.</p>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted">{detail}</p>
      <Link
        href="/sign-in"
        className="mt-6 inline-flex text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
      >
        Sign in
      </Link>
    </main>
  );
}

function AccessChecking() {
  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Ox Management</p>
      <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        DirtyDecember
      </h1>
      <p className="mt-6 text-base leading-7 text-ink">Checking access…</p>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
        Confirming the sign-in session for this page.
      </p>
    </main>
  );
}

function SectionLoadError({ title }: { title: string }) {
  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        This section could not be loaded. The rest of the console is still available. Try reload, or
        open another section from the menu.
      </p>
    </section>
  );
}

function safeSection(title: string, render: () => ReactNode | Promise<ReactNode>) {
  async function BoundSection() {
    try {
      return await render();
    } catch (error) {
      console.error(`Admin section: ${title}`, error);
      return <SectionLoadError title={title} />;
    }
  }
  return <BoundSection />;
}

async function SubmissionsPanel() {
  const submissions = await listUnpublishedSubmissions();
  const pictures =
    submissions.reason === "ok" ? await signSubmissionPictures(submissions.rows) : new Map<string, string | null>();

  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Submissions</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Unpublished intake only. A submission is not added to the public event list until published
        elsewhere.
      </p>
      {submissions.reason === "no-key" ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          Submissions are not listed because the server key is not set.
        </p>
      ) : submissions.reason === "error" ? (
        <p className="mt-3 text-sm leading-7 text-muted">Submissions could not be read.</p>
      ) : submissions.rows.length === 0 ? (
        <p className="mt-3 text-sm leading-7 text-ink">No submissions are on file.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {submissions.rows.map((row) => (
            <li key={row.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{row.kind}</p>
              <p>{submissionLine(row)}</p>
              <p>{row.sender_email}</p>
              {row.public_link ? (
                <a
                  href={row.public_link}
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  {row.public_link}
                </a>
              ) : null}
              {row.image_path || row.image_unreadable ? (
                pictures.get(row.id) ? (
                  <img
                    src={pictures.get(row.id) ?? ""}
                    alt="Submission picture"
                    className="mt-3 max-h-48 max-w-full object-contain"
                  />
                ) : (
                  <p className="mt-2 text-sm leading-6 text-muted">{PICTURE_SHOW_MESSAGE}</p>
                )
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

async function ReviewsPanel() {
  const reviews = await listPublicReviews();

  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Reviews</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Public text reviews already on file. Full UGC moderation UI stays on the pending Supabase
        UGC branch. This panel only lists what main already exposes.
      </p>
      {reviews.failed ? (
        <p className="mt-3 text-sm leading-7 text-muted">Reviews could not be read.</p>
      ) : reviews.rows.length === 0 ? (
        <p className="mt-3 text-sm leading-7 text-ink">No reviews are on file.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {reviews.rows.map((review) => (
            <li key={review.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink">
              {review.body}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

async function AdminSession({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const auth = directorySignIn();
  const user = await getDirectoryUser();
  if (!user) {
    return (
      <AccessRefused detail="Nobody is signed in. Open the sign-in page, request an email link, and open that link in this same browser. Then return here." />
    );
  }
  const allowed = isAdminEmail(user.email);
  if (!allowed) {
    return (
      <AccessRefused
        detail={`Signed in as ${user.email}. That address is not on the admin allowlist.`}
      />
    );
  }

  const params = await searchParams;
  const section = parseAdminSection(params.section);

  return (
    <AdminShell email={user?.email ?? auth.adminEmail ?? ""} section={section}>
      {section === "overview" ? safeSection("Overview", () => AdminOverviewSection()) : null}

      {section === "events" ? safeSection("Events", () => AdminEventsSection()) : null}

      {section === "featured" ? safeSection("Featured", () => AdminFeaturedSection()) : null}

      {section === "places" ? safeSection("Places", () => AdminPlacesSection()) : null}

      {section === "get-featured" ? (
        <Suspense
          fallback={
            <section className="min-w-0">
              <h2 className="font-display text-3xl leading-none tracking-tight">Get featured</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Loading placements…</p>
            </section>
          }
        >
          {safeSection("Get featured", () => AdminGetFeaturedSection())}
        </Suspense>
      ) : null}

      {section === "clicks" ? (
        <Suspense
          fallback={
            <section className="min-w-0">
              <h2 className="font-display text-3xl leading-none tracking-tight">Outbound clicks</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Loading clicks…</p>
            </section>
          }
        >
          {safeSection("Outbound clicks", () => AdminOutboundClicksSection())}
        </Suspense>
      ) : null}

      {section === "dashboard" ? (
        <Suspense fallback={<SiteAnalyticsSectionFallback />}>
          {safeSection("Dashboard / Insights", () => SiteAnalyticsSection())}
        </Suspense>
      ) : null}

      {section === "submissions" ? (
        <Suspense
          fallback={
            <section className="min-w-0">
              <h2 className="font-display text-3xl leading-none tracking-tight">Submissions</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Loading submissions…</p>
            </section>
          }
        >
          {safeSection("Submissions", () => SubmissionsPanel())}
        </Suspense>
      ) : null}

      {section === "reviews" ? (
        <Suspense
          fallback={
            <section className="min-w-0">
              <h2 className="font-display text-3xl leading-none tracking-tight">Reviews</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Loading reviews…</p>
            </section>
          }
        >
          {safeSection("Reviews", () => ReviewsPanel())}
        </Suspense>
      ) : null}

      {section === "probes" ? (
        <Suspense fallback={<WpProbeSectionFallback />}>
          {safeSection("Probes", () => WpProbeSection({ searchParams: params }))}
        </Suspense>
      ) : null}

      {section === "settings" ? (
        <Suspense fallback={<AdminSettingsSectionFallback />}>
          {safeSection("Settings", () => AdminSettingsSection())}
        </Suspense>
      ) : null}
    </AdminShell>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!directorySignIn().connected) {
    return (
      <AccessRefused detail="The directory sign-in is not connected yet, so the records stay closed. Nobody is signed in." />
    );
  }

  // Await searchParams inside AdminSession (under Suspense). Awaiting here breaks
  // production builds when cacheComponents is on.
  return (
    <Suspense
      fallback={<AccessChecking />}
    >
      <AdminSession searchParams={searchParams} />
    </Suspense>
  );
}
