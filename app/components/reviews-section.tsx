import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { directorySignIn } from "../directory-auth";
import { listPublicReviews, type ReviewRow } from "../reviews";
import { getDirectoryUser } from "../supabase/session";
import { ReviewForm } from "./review-form";

function ReviewsShell({ children }: { children: ReactNode }) {
  return (
    <section id="reviews" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">On file</p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">Reviews</h2>
        {children}
      </div>
    </section>
  );
}

function ReviewList({ rows }: { rows: ReviewRow[] }) {
  if (rows.length === 0) {
    return <p className="mt-4 max-w-2xl text-sm leading-7 text-ink">No reviews are on file.</p>;
  }
  return (
    <ul className="mt-4 grid max-w-2xl gap-3">
      {rows.map((review) => (
        <li key={review.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink">
          {review.body}
        </li>
      ))}
    </ul>
  );
}

function SignInForReview() {
  return (
    <p className="mt-4 text-sm leading-7 text-muted">
      A review can be submitted after sign-in.{" "}
      <Link href="/sign-in" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
        Sign in
      </Link>
    </p>
  );
}

function ReviewsClosed() {
  return (
    <ReviewsShell>
      <ReviewList rows={[]} />
      <SignInForReview />
    </ReviewsShell>
  );
}

async function ConnectedReviews() {
  const listed = await listPublicReviews();
  const user = await getDirectoryUser();

  return (
    <ReviewsShell>
      {listed.failed ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Reviews could not be read.</p>
      ) : (
        <ReviewList rows={listed.rows} />
      )}
      {user ? <ReviewForm /> : <SignInForReview />}
    </ReviewsShell>
  );
}

export function ReviewsSection() {
  if (!directorySignIn().connected) return <ReviewsClosed />;

  return (
    <Suspense fallback={<ReviewsClosed />}>
      <ConnectedReviews />
    </Suspense>
  );
}
