import "server-only";
import { directorySignIn } from "./directory-auth";
import { isSubmissionImagePath } from "./submission-picture";
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
  category: string | null;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  public_link: string | null;
  image_path: string | null;
  image_unreadable: boolean;
};

const SUBMISSION_SELECT_FULL =
  "id, kind, sender_email, event_name, city, dates, venue, product_name, business_name, offer, category, note, latitude, longitude, public_link, image_path";
const SUBMISSION_SELECT_WITH_IMAGE =
  "id, kind, sender_email, event_name, city, dates, venue, product_name, business_name, offer, public_link, image_path";
const SUBMISSION_SELECT_BASE =
  "id, kind, sender_email, event_name, city, dates, venue, product_name, business_name, offer, public_link";

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code === "PGRST204") return true;
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("schema cache") ||
    message.includes("could not find") ||
    (message.includes("column") && message.includes("does not exist"))
  );
}

function mapSubmissionRows(data: Record<string, unknown>[]): SubmissionRow[] {
  return data.flatMap((row) => {
    if (typeof row.id !== "string" || typeof row.kind !== "string" || typeof row.sender_email !== "string") {
      return [];
    }
    const rawPath = typeof row.image_path === "string" ? row.image_path.trim() : "";
    const readable = rawPath !== "" && isSubmissionImagePath(rawPath);
    return [
      {
        id: row.id,
        kind: row.kind,
        sender_email: row.sender_email,
        event_name: textOrNull(row.event_name),
        city: textOrNull(row.city),
        dates: textOrNull(row.dates),
        venue: textOrNull(row.venue),
        product_name: textOrNull(row.product_name),
        business_name: textOrNull(row.business_name),
        offer: textOrNull(row.offer),
        category: textOrNull(row.category),
        note: textOrNull(row.note),
        latitude: numberOrNull(row.latitude),
        longitude: numberOrNull(row.longitude),
        public_link: textOrNull(row.public_link),
        image_path: readable ? rawPath : null,
        image_unreadable: rawPath !== "" && !readable,
      },
    ];
  });
}

export async function listUnpublishedSubmissions(): Promise<{
  rows: SubmissionRow[];
  reason: "ok" | "no-key" | "error";
}> {
  if (!directorySignIn().connected) return { rows: [], reason: "no-key" };
  const supabase = createServiceClient();
  if (!supabase) return { rows: [], reason: "no-key" };

  const selects = [SUBMISSION_SELECT_FULL, SUBMISSION_SELECT_WITH_IMAGE, SUBMISSION_SELECT_BASE];
  let lastError: { code?: string; message?: string } | null = null;

  for (const columns of selects) {
    const { data, error } = await supabase
      .from("submissions")
      .select(columns)
      .eq("status", "unpublished")
      .order("created_at", { ascending: true });

    if (!error && data) {
      return {
        rows: mapSubmissionRows(data as unknown as Record<string, unknown>[]),
        reason: "ok",
      };
    }

    lastError = error;
    if (!isMissingColumnError(error)) break;
  }

  console.error("listUnpublishedSubmissions failed", {
    code: lastError?.code,
    message: lastError?.message,
  });
  return { rows: [], reason: "error" };
}

function textOrNull(value: unknown) {
  return typeof value === "string" ? value : null;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Signed URLs for the admin page. Call this only after the admin email check. */
export async function signSubmissionPictures(rows: SubmissionRow[]) {
  const urls = new Map<string, string | null>();
  const supabase = createServiceClient();
  if (!supabase) return urls;
  for (const row of rows) {
    if (row.image_unreadable || !row.image_path) {
      if (row.image_unreadable) urls.set(row.id, null);
      continue;
    }
    const { data, error } = await supabase.storage.from("submission-images").createSignedUrl(row.image_path, 120);
    urls.set(row.id, error || !data?.signedUrl ? null : data.signedUrl);
  }
  return urls;
}
