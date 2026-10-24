import Link from "next/link";
import { Suspense } from "react";
import { directorySignIn } from "../directory-auth";
import { listSubjectQuestions, listSubjectReviews, summarizeRatings } from "../ugc";
import type { EventOrPlaceSubject } from "../ugc-subject";
import { getDirectoryUser } from "../supabase/session";
import { AnswerForm } from "./answer-form";
import { EmptyNote, LoadingLines } from "./states";
import { HelpfulVote } from "./helpful-vote";
import { QuestionForm } from "./question-form";
import { ReviewForm } from "./review-form";

function Stars({ rating }: { rating: number }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.16em] text-brass" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-ink/25">{"★".repeat(5 - rating)}</span>
    </p>
  );
}

function SignInPrompt({ label }: { label: string }) {
  return (
    <p className="mt-4 text-sm leading-7 text-muted">
      {label}{" "}
      <Link href="/sign-in" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
        Sign in
      </Link>
    </p>
  );
}

async function SubjectUgcBody({
  subject,
  heading,
}: {
  subject: EventOrPlaceSubject;
  heading: string;
}) {
  const user = await getDirectoryUser();
  const listed = await listSubjectReviews(subject);
  const questions = await listSubjectQuestions(subject);

  if (listed.failed || questions.failed) {
    return (
      <section className="mt-14 border-t border-ink/10 pt-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Visitor notes</p>
        <h2 className="mt-3 font-display text-3xl leading-none tracking-tight">{heading}</h2>
        <p className="mt-4 max-w-xl border border-oxide px-4 py-4 text-sm leading-7" role="alert">
          Reviews and questions could not be loaded. Try again in a moment.
        </p>
      </section>
    );
  }

  const summary = summarizeRatings(listed.rows);

  return (
    <section className="mt-14 border-t border-ink/10 pt-10">
      <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Visitor notes</p>
      <h2 className="mt-3 font-display text-3xl leading-none tracking-tight">{heading}</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Ratings and reviews here are visitor UGC in our database. Verified directory copy never invents stars.
      </p>

      {summary.count > 0 && summary.average !== null ? (
        <p className="mt-4 text-sm leading-7 text-ink">
          Average {summary.average} from {summary.count} {summary.count === 1 ? "rating" : "ratings"}.
        </p>
      ) : (
        <div className="mt-4">
          <EmptyNote>No ratings or reviews are on file for this listing yet.</EmptyNote>
        </div>
      )}

      {listed.rows.length > 0 ? (
        <ul className="mt-6 grid max-w-2xl gap-3">
          {listed.rows.map((review) => (
            <li key={review.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink">
              {review.rating !== null ? <Stars rating={review.rating} /> : null}
              <p className={review.rating !== null ? "mt-2" : undefined}>{review.body}</p>
              <HelpfulVote
                reviewId={review.id}
                helpfulCount={review.helpfulCount}
                subjectKind={subject.kind}
                subjectKey={subject.key}
                signedIn={Boolean(user)}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {user ? (
        <ReviewForm subjectKind={subject.kind} subjectKey={subject.key} requireRating />
      ) : (
        <SignInPrompt label="A review with a rating can be submitted after sign-in." />
      )}

      <div className="mt-12">
        <h3 className="font-display text-2xl leading-none tracking-tight">Questions</h3>
        {questions.rows.length === 0 ? (
          <div className="mt-4">
            <EmptyNote>No questions are on file for this listing yet.</EmptyNote>
          </div>
        ) : (
          <ul className="mt-4 grid max-w-2xl gap-4">
            {questions.rows.map((question) => (
              <li key={question.id} className="border border-ink/15 px-4 py-3">
                <p className="text-sm leading-6 text-ink">{question.body}</p>
                {question.answers.length > 0 ? (
                  <ul className="mt-3 grid gap-2 border-t border-ink/10 pt-3">
                    {question.answers.map((answer) => (
                      <li key={answer.id} className="text-sm leading-6 text-muted">
                        {answer.body}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-muted">No published answers yet.</p>
                )}
                {user ? (
                  <AnswerForm
                    questionId={question.id}
                    subjectKind={subject.kind}
                    subjectKey={subject.key}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {user ? (
          <QuestionForm subjectKind={subject.kind} subjectKey={subject.key} />
        ) : (
          <SignInPrompt label="Ask a question after sign-in." />
        )}
      </div>
    </section>
  );
}

export function SubjectUgc({
  subject,
  heading = "Ratings and reviews",
}: {
  subject: EventOrPlaceSubject;
  heading?: string;
}) {
  if (!directorySignIn().connected) {
    return (
      <section className="mt-14 border-t border-ink/10 pt-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Visitor notes</p>
        <h2 className="mt-3 font-display text-3xl leading-none tracking-tight">{heading}</h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
          Reviews and Q&A open when the directory database is connected. Nothing is invented here.
        </p>
      </section>
    );
  }

  return (
    <Suspense
      fallback={
        <section className="mt-14 border-t border-ink/10 pt-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Visitor notes</p>
          <h2 className="mt-3 font-display text-3xl leading-none tracking-tight">{heading}</h2>
          <div className="mt-4">
            <LoadingLines label="Loading reviews" />
          </div>
        </section>
      }
    >
      <SubjectUgcBody subject={subject} heading={heading} />
    </Suspense>
  );
}
