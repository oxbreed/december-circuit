"use server";

import { revalidatePath } from "next/cache";
import { eventBySlug } from "./event-view";
import { liveEventBySlug, livePlaceBySlug } from "./live-directory";
import { placeBySlug } from "./place-catalog";
import { createServiceClient } from "./supabase/server";
import { getDirectoryUser } from "./supabase/session";

export async function saveListingRating(
  kind: "event" | "place",
  slug: string,
  _previous: { message: string; ok: boolean },
  data: FormData,
) {
  const score = Number(data.get("score"));
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return { ok: false, message: "Choose a rating from 1 to 5 stars." };
  }

  const user = await getDirectoryUser();
  if (!user) return { ok: false, message: "Sign in to rate this listing." };

  const database = createServiceClient();
  if (!database) return { ok: false, message: "Ratings are currently unavailable." };

  if ((kind !== "event" && kind !== "place") || typeof slug !== "string" || !slug || slug.length > 200) {
    return { ok: false, message: "This listing is unavailable." };
  }

  const listing = kind === "event"
    ? (await liveEventBySlug(slug)) ?? eventBySlug(slug)
    : (await livePlaceBySlug(slug)) ?? placeBySlug(slug);
  if (!listing || ("canonical" in listing && !listing.canonical)) return { ok: false, message: "This listing is unavailable." };

  const { error } = await database.from("listing_ratings").upsert({
    subject_kind: kind,
    subject_slug: slug,
    author_id: user.id,
    score,
  }, { onConflict: "subject_kind,subject_slug,author_id" });
  if (error) return { ok: false, message: "Your rating could not be saved. Try again shortly." };

  revalidatePath(kind === "event" ? `/events/${slug}` : `/place/${slug}`);
  return { ok: true, message: "Your rating is saved." };
}
