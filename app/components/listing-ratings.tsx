import Link from "next/link";
import { createServiceClient } from "../supabase/server";
import { getDirectoryUser } from "../supabase/session";
import { ListingRatingForm } from "./listing-rating-form";

export async function ListingRatings({ kind, slug }: { kind: "event" | "place"; slug: string }) {
  const database = createServiceClient();
  if (!database) return null;

  const [summary, user] = await Promise.all([
    database.rpc("listing_rating_summary", { kind, slug }).single<{ average: number | null; total: number }>(),
    getDirectoryUser(),
  ]);
  if (summary.error || !summary.data) return null;

  const { average, total } = summary.data;
  const current = user ? await database.from("listing_ratings").select("score")
    .eq("subject_kind", kind).eq("subject_slug", slug).eq("author_id", user.id).maybeSingle() : null;

  return (
    <section className="mx-auto w-full max-w-6xl border-t border-ink/10 px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="listing-ratings">
      <h2 id="listing-ratings" className="font-display text-3xl">Visitor ratings</h2>
      <p className="mt-2 text-muted">
        {total ? `${Number(average).toFixed(1)} out of 5 · ${total} ${total === 1 ? "rating" : "ratings"}` : "No ratings yet."}
      </p>
      {user ? <ListingRatingForm kind={kind} slug={slug} score={current?.data?.score} /> : (
        <p className="mt-3 text-sm"><Link href="/sign-in" className="underline underline-offset-4">Sign in</Link> to rate this listing.</p>
      )}
    </section>
  );
}
