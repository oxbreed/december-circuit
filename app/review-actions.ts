"use server";

import { directorySignIn } from "./directory-auth";
import { createDirectoryClient } from "./supabase/server";

export type ReviewState = { status: "idle" | "saved" | "error"; message?: string };

export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  if (!directorySignIn().connected) {
    return { status: "error", message: "The directory sign-in is not connected yet." };
  }
  const body = String(formData.get("body") ?? "").trim();
  if (!body || body.length > 2000) {
    return { status: "error", message: "Write a review of 2000 characters or fewer." };
  }
  const supabase = await createDirectoryClient();
  if (!supabase) {
    return { status: "error", message: "The directory sign-in is not connected yet." };
  }
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    return { status: "error", message: "Sign in before submitting a review." };
  }
  const { error } = await supabase.from("reviews").insert({ body, author_id: data.user.id });
  if (error) {
    return { status: "error", message: "The review could not be saved." };
  }
  return { status: "saved", message: "The review is saved." };
}
