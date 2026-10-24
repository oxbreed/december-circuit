import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { directorySignIn } from "../directory-auth";
import { providerReports } from "../providers";
import { listPublicReviews, listUnpublishedSubmissions, signSubmissionPictures } from "../reviews";
import { PICTURE_SHOW_MESSAGE } from "../submission-picture";
import { pageMetadata } from "../site";
import { getDirectoryUser } from "../supabase/session";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Admin",
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
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Records</p>
      <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        Admin
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

async function AdminSession() {
  const auth = directorySignIn();
  const user = await getDirectoryUser();
  const allowed = Boolean(user && auth.adminEmail && user.email === auth.adminEmail);
  if (!allowed) {
    return (
      <AccessRefused
        detail={
          user
            ? "This page opens only for the admin address held on the server."
            : "Nobody is signed in. This page opens only for the admin address held on the server."
        }
      />
    );
  }

  const submissions = await listUnpublishedSubmissions();
  const pictures = submissions.reason === "ok" ? await signSubmissionPictures(submissions.rows) : new Map<string, string | null>();
  const reviews = await listPublicReviews();
  const providers = providerReports();

  return (
    <main id="top" className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16 pt-20 sm:px-6 md:px-8 lg:pt-36">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Records</p>
      <h1 className="mt-2 font-display text-[2.15rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
        Admin
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-7 text-muted">
        Signed in as {user?.email}. The public event list is the file on this site. A submission is
        not added to it.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-3xl leading-none tracking-tight">Unpublished submissions</h2>
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

      <section className="mt-8">
        <h2 className="font-display text-3xl leading-none tracking-tight">Reviews</h2>
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

      <section className="mt-8">
        <h2 className="font-display text-3xl leading-none tracking-tight">Providers</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink">
          {providers.map((provider) => (
            <li key={provider.name}>
              {provider.name}: {provider.detail}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default function AdminPage() {
  if (!directorySignIn().connected) {
    return (
      <AccessRefused detail="Nobody is signed in. The directory sign-in is not connected yet, so the records stay closed." />
    );
  }

  return (
    <Suspense
      fallback={
        <AccessRefused detail="Nobody is signed in. This page opens only for the admin address held on the server." />
      }
    >
      <AdminSession />
    </Suspense>
  );
}
