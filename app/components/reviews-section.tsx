import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { directorySignIn } from "../directory-auth";
import { listPublicReviews, type ReviewRow } from "../reviews";
import { getDirectoryUser } from "../supabase/session";
import { EmptyNote, LoadingLines } from "./states";
import { ReviewForm } from "./review-form";

function ReviewsShell({ children }: { children: ReactNode }) {
  return (
    <section id="reviews" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Reviews</p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">Reviews</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Visitor notes stored in our database. Event and place ratings live on those pages. Nothing here is invented.
        </p>
        {children}
      </div>
    </section>
  );
}

function ReviewList({ rows }: { rows: ReviewRow[] }) {
  return (
    <ul className="mt-4 grid max-w-2xl gap-3">
      {rows.map((review) => (
        <li key={review.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink">
          {review.rating !== null ? (
            <p className="text-[11px] uppercase tracking-[0.16em] text-brass" aria-label={`${review.rating} out of 5`}>
              {"★".repeat(review.rating)}
              <span className="text-ink/25">{"★".repeat(5 - review.rating)}</span>
            </p>
          ) : null}
          <p className={review.rating !== null ? "mt-2" : undefined}>{review.body}</p>
        </li>
      ))}
    </ul>
  );
}

function SignInForReview() {
  return (
    <p className="mt-4 text-sm leading-7 text-muted">
      A site review can be submitted after sign-in.{" "}
      <Link href="/sign-in" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
        Sign in
      </Link>
    </p>
  );
}

async function ConnectedReviews() {
  const listed = await listPublicReviews();
  const user = await getDirectoryUser();

  if (listed.failed) {
    return (
      <ReviewsShell>
        <p className="mt-4 max-w-xl border border-oxide px-4 py-4 text-sm leading-7" role="alert">
          Reviews could not be loaded. Try again in a moment.
        </p>
      </ReviewsShell>
    );
  }

  return (
    <ReviewsShell>
      {listed.rows.length === 0 ? (
        <div className="mt-4">
          <EmptyNote>No reviews are on file yet.</EmptyNote>
        </div>
      ) : (
        <ReviewList rows={listed.rows} />
      )}
      {user ? <ReviewForm /> : <SignInForReview />}
    </ReviewsShell>
  );
}

export function ReviewsSection() {
  if (!directorySignIn().connected) {
    return (
      <ReviewsShell>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Reviews open when the directory database is connected. The block stays empty until a visitor publishes one.
        </p>
      </ReviewsShell>
    );
  }

  return (
    <Suspense
      fallback={
        <ReviewsShell>
          <div className="mt-4">
            <LoadingLines label="Loading reviews" />
          </div>
        </ReviewsShell>
      }
    >
      <ConnectedReviews />
    </Suspense>
  );
}
