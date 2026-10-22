import Link from "next/link";
import { directorySignIn } from "../directory-auth";
import { listPublicReviews } from "../reviews";
import { getDirectoryUser } from "../supabase/session";
import { ReviewForm } from "./review-form";

export async function ReviewsSection() {
  const connected = directorySignIn().connected;
  const listed = connected ? await listPublicReviews() : { rows: [], failed: false };
  const user = connected ? await getDirectoryUser() : null;

  return (
    <section id="reviews" className="scroll-mt-36 border-b border-ink/10">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">On file</p>
        <h2 className="mt-3 font-display text-4xl leading-none tracking-tight md:text-5xl">Reviews</h2>
        {listed.failed ? (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Reviews could not be read.</p>
        ) : listed.rows.length === 0 ? (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink">No reviews are on file.</p>
        ) : (
          <ul className="mt-4 grid max-w-2xl gap-3">
            {listed.rows.map((review) => (
              <li key={review.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink">
                {review.body}
              </li>
            ))}
          </ul>
        )}
        {user ? (
          <ReviewForm />
        ) : (
          <p className="mt-4 text-sm leading-7 text-muted">
            A review can be submitted after sign-in.{" "}
            <Link
              href="/sign-in"
              className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
