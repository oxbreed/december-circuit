import "server-only";
import { directorySignIn } from "./directory-auth";
import { createAnonClient, createServiceClient } from "./supabase/server";

export type ReviewRow = { id: string; body: string };

export async function listPublicReviews(): Promise<{ rows: ReviewRow[]; failed: boolean }> {
  if (!directorySignIn().connected) return { rows: [], failed: false };
  const supabase = createAnonClient();
  if (!supabase) return { rows: [], failed: false };
  const { data, error } = await supabase
    .from("reviews")
    .select("id, body")
    .order("created_at", { ascending: true });
  if (error || !data) return { rows: [], failed: true };
  return {
    rows: data.flatMap((row) => {
      if (typeof row.id !== "string" || typeof row.body !== "string") return [];
      const body = row.body.trim();
      if (!body) return [];
      return [{ id: row.id, body }];
    }),
    failed: false,
  };
}

export type SubmissionRow = {
  id: string;
  kind: string;
  sender_email: string;
  event_name: string | null;
  city: string | null;
  dates: string | null;
  venue: string | null;
  product_name: string | null;
  business_name: string | null;
  offer: string | null;
  public_link: string | null;
};

export async function listUnpublishedSubmissions(): Promise<{
  rows: SubmissionRow[];
  reason: "ok" | "no-key" | "error";
}> {
  if (!directorySignIn().connected) return { rows: [], reason: "no-key" };
  const supabase = createServiceClient();
  if (!supabase) return { rows: [], reason: "no-key" };
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, kind, sender_email, event_name, city, dates, venue, product_name, business_name, offer, public_link",
    )
    .eq("status", "unpublished")
    .order("created_at", { ascending: true });
  if (error || !data) return { rows: [], reason: "error" };
  return { rows: data as SubmissionRow[], reason: "ok" };
}
