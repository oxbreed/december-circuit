import "server-only";
import { directorySignIn } from "./directory-auth";
import { createAnonClient, createServiceClient } from "./supabase/server";
import type { UgcSubject } from "./ugc-subject";

export type SubjectReview = {
  id: string;
  body: string;
  rating: number | null;
  helpfulCount: number;
  createdAt: string | null;
};

export type SubjectQuestion = {
  id: string;
  body: string;
  createdAt: string | null;
  answers: { id: string; body: string; createdAt: string | null }[];
};

export type SubjectRatingSummary = {
  average: number | null;
  count: number;
};

function textOrNull(value: unknown) {
  return typeof value === "string" ? value : null;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Published reviews for one event or place. Empty when none; failed when the query errors. */
export async function listSubjectReviews(
  subject: UgcSubject,
): Promise<{ rows: SubjectReview[]; failed: boolean }> {
  if (!directorySignIn().connected) return { rows: [], failed: false };
  const supabase = createAnonClient();
  if (!supabase) return { rows: [], failed: false };

  const { data, error } = await supabase
    .from("reviews")
    .select("id, body, rating, created_at")
    .eq("subject_kind", subject.kind)
    .eq("subject_key", subject.key)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) return { rows: [], failed: true };

  const ids = data.flatMap((row) => (typeof row.id === "string" ? [row.id] : []));
  const helpfulCounts = await countHelpfulVotes(ids);

  return {
    rows: data.flatMap((row) => {
      if (typeof row.id !== "string" || typeof row.body !== "string") return [];
      const body = row.body.trim();
      if (!body) return [];
      const rating = numberOrNull(row.rating);
      if (subject.kind !== "site" && (rating === null || rating < 1 || rating > 5)) return [];
      return [
        {
          id: row.id,
          body,
          rating: subject.kind === "site" ? null : rating,
          helpfulCount: helpfulCounts.get(row.id) ?? 0,
          createdAt: textOrNull(row.created_at),
        },
      ];
    }),
    failed: false,
  };
}

export function summarizeRatings(rows: SubjectReview[]): SubjectRatingSummary {
  const rated = rows.flatMap((row) => (row.rating !== null ? [row.rating] : []));
  if (rated.length === 0) return { average: null, count: 0 };
  const sum = rated.reduce((total, value) => total + value, 0);
  return { average: Math.round((sum / rated.length) * 10) / 10, count: rated.length };
}

async function countHelpfulVotes(reviewIds: string[]) {
  const counts = new Map<string, number>();
  if (reviewIds.length === 0) return counts;
  const supabase = createAnonClient();
  if (!supabase) return counts;
  const { data, error } = await supabase.from("helpful_votes").select("review_id").in("review_id", reviewIds);
  if (error || !data) return counts;
  for (const row of data) {
    if (typeof row.review_id !== "string") continue;
    counts.set(row.review_id, (counts.get(row.review_id) ?? 0) + 1);
  }
  return counts;
}

export async function listSubjectQuestions(
  subject: Extract<UgcSubject, { kind: "event" | "place" }>,
): Promise<{ rows: SubjectQuestion[]; failed: boolean }> {
  if (!directorySignIn().connected) return { rows: [], failed: false };
  const supabase = createAnonClient();
  if (!supabase) return { rows: [], failed: false };

  const { data: questions, error } = await supabase
    .from("ugc_questions")
    .select("id, body, created_at")
    .eq("subject_kind", subject.kind)
    .eq("subject_key", subject.key)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !questions) return { rows: [], failed: true };

  const ids = questions.flatMap((row) => (typeof row.id === "string" ? [row.id] : []));
  const answersByQuestion = await listPublishedAnswers(ids);

  return {
    rows: questions.flatMap((row) => {
      if (typeof row.id !== "string" || typeof row.body !== "string") return [];
      const body = row.body.trim();
      if (!body) return [];
      return [
        {
          id: row.id,
          body,
          createdAt: textOrNull(row.created_at),
          answers: answersByQuestion.get(row.id) ?? [],
        },
      ];
    }),
    failed: false,
  };
}

async function listPublishedAnswers(questionIds: string[]) {
  const map = new Map<string, SubjectQuestion["answers"]>();
  if (questionIds.length === 0) return map;
  const supabase = createAnonClient();
  if (!supabase) return map;
  const { data, error } = await supabase
    .from("ugc_answers")
    .select("id, question_id, body, created_at")
    .in("question_id", questionIds)
    .eq("status", "published")
    .order("created_at", { ascending: true });
  if (error || !data) return map;
  for (const row of data) {
    if (
      typeof row.id !== "string" ||
      typeof row.question_id !== "string" ||
      typeof row.body !== "string"
    ) {
      continue;
    }
    const body = row.body.trim();
    if (!body) continue;
    const list = map.get(row.question_id) ?? [];
    list.push({ id: row.id, body, createdAt: textOrNull(row.created_at) });
    map.set(row.question_id, list);
  }
  return map;
}

/** Signed URLs for published review photos. Service key only; empty when unavailable. */
export async function signPublishedReviewPhotos(reviewIds: string[]) {
  const byReview = new Map<string, string[]>();
  if (reviewIds.length === 0) return byReview;
  const supabase = createServiceClient();
  if (!supabase) return byReview;

  const { data, error } = await supabase
    .from("review_photos")
    .select("review_id, storage_path")
    .in("review_id", reviewIds)
    .eq("status", "published");
  if (error || !data) return byReview;

  for (const row of data) {
    if (typeof row.review_id !== "string" || typeof row.storage_path !== "string") continue;
    const { data: signed, error: signError } = await supabase.storage
      .from("review-photos")
      .createSignedUrl(row.storage_path, 120);
    if (signError || !signed?.signedUrl) continue;
    const list = byReview.get(row.review_id) ?? [];
    list.push(signed.signedUrl);
    byReview.set(row.review_id, list);
  }
  return byReview;
}
