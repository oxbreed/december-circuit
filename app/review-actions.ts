"use server";

import { revalidatePath } from "next/cache";
import { directorySignIn } from "./directory-auth";
import { createDirectoryClient } from "./supabase/server";
import { isUgcSubjectKind } from "./ugc-subject";

export type ReviewState = { status: "idle" | "saved" | "error"; message?: string };
export type VoteState = { status: "idle" | "saved" | "error"; message?: string };
export type QuestionState = { status: "idle" | "saved" | "error"; message?: string };

function field(formData: FormData, name: string, max: number) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value || value.length > max) return null;
  return value;
}

async function requireSignedInClient() {
  if (!directorySignIn().connected) {
    return { error: "The directory sign-in is not connected yet." as const };
  }
  const supabase = await createDirectoryClient();
  if (!supabase) {
    return { error: "The directory sign-in is not connected yet." as const };
  }
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { error: "Sign in before submitting." as const };
  }
  return { supabase, userId: data.user.id };
}

export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const auth = await requireSignedInClient();
  if ("error" in auth) return { status: "error", message: auth.error };

  const body = field(formData, "body", 2000);
  if (!body) {
    return { status: "error", message: "Write a review of 2000 characters or fewer." };
  }

  const subjectKindRaw = String(formData.get("subject_kind") ?? "site").trim();
  const subjectKey = field(formData, "subject_key", 200) ?? "home";
  if (!assertSubjectKind(subjectKindRaw)) {
    return { status: "error", message: "This review could not be saved." };
  }

  const row: {
    body: string;
    author_id: string;
    subject_kind: string;
    subject_key: string;
    status: "published";
    rating?: number;
  } = {
    body,
    author_id: auth.userId,
    subject_kind: subjectKindRaw,
    subject_key: subjectKey,
    status: "published",
  };

  if (subjectKindRaw === "event" || subjectKindRaw === "place") {
    const rating = Number(String(formData.get("rating") ?? "").trim());
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { status: "error", message: "Choose a rating from 1 to 5." };
    }
    row.rating = rating;
  }

  const { error } = await auth.supabase.from("reviews").insert(row);
  if (error) {
    return { status: "error", message: "The review could not be saved." };
  }

  revalidateSubject(subjectKindRaw, subjectKey);
  return { status: "saved", message: "The review is saved." };
}

export async function markReviewHelpful(_prev: VoteState, formData: FormData): Promise<VoteState> {
  const auth = await requireSignedInClient();
  if ("error" in auth) return { status: "error", message: auth.error };

  const reviewId = field(formData, "review_id", 80);
  if (!reviewId) return { status: "error", message: "That review could not be marked." };

  const { error } = await auth.supabase.from("helpful_votes").insert({
    review_id: reviewId,
    voter_id: auth.userId,
  });
  if (error) {
    if (error.code === "23505") {
      return { status: "saved", message: "Already marked helpful." };
    }
    return { status: "error", message: "The helpful mark could not be saved." };
  }

  const subjectKind = String(formData.get("subject_kind") ?? "").trim();
  const subjectKey = String(formData.get("subject_key") ?? "").trim();
  if (assertSubjectKind(subjectKind) && subjectKey) {
    revalidateSubject(subjectKind, subjectKey);
  }
  return { status: "saved", message: "Marked helpful." };
}

export async function submitQuestion(_prev: QuestionState, formData: FormData): Promise<QuestionState> {
  const auth = await requireSignedInClient();
  if ("error" in auth) return { status: "error", message: auth.error };

  const body = field(formData, "body", 1000);
  const subjectKind = String(formData.get("subject_kind") ?? "").trim();
  const subjectKey = field(formData, "subject_key", 200);
  if (!body || !subjectKey || !isUgcSubjectKind(subjectKind)) {
    return { status: "error", message: "Ask a short question about this listing." };
  }

  const { error } = await auth.supabase.from("ugc_questions").insert({
    body,
    author_id: auth.userId,
    subject_kind: subjectKind,
    subject_key: subjectKey,
    status: "published",
  });
  if (error) {
    return { status: "error", message: "The question could not be saved." };
  }

  revalidateSubject(subjectKind, subjectKey);
  return { status: "saved", message: "The question is saved." };
}

export async function submitAnswer(_prev: QuestionState, formData: FormData): Promise<QuestionState> {
  const auth = await requireSignedInClient();
  if ("error" in auth) return { status: "error", message: auth.error };

  const body = field(formData, "body", 2000);
  const questionId = field(formData, "question_id", 80);
  if (!body || !questionId) {
    return { status: "error", message: "Write an answer of 2000 characters or fewer." };
  }

  const { error } = await auth.supabase.from("ugc_answers").insert({
    body,
    question_id: questionId,
    author_id: auth.userId,
    status: "unpublished",
  });
  if (error) {
    return { status: "error", message: "The answer could not be saved." };
  }

  const subjectKind = String(formData.get("subject_kind") ?? "").trim();
  const subjectKey = String(formData.get("subject_key") ?? "").trim();
  if (assertSubjectKind(subjectKind) && subjectKey) {
    revalidateSubject(subjectKind, subjectKey);
  }
  return {
    status: "saved",
    message: "Saved as unpublished. It stays off the public page until a person checks it.",
  };
}

function revalidateSubject(kind: string, key: string) {
  revalidatePath("/");
  if (kind === "event") revalidatePath(`/events/${key}`);
  if (kind === "place") revalidatePath("/places");
}

function assertSubjectKind(value: string): value is "event" | "place" | "site" {
  return value === "event" || value === "place" || value === "site";
}
