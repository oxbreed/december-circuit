import "server-only";
import { isMissingColumnError, isMissingRelationError, requireAdminService } from "./admin-guard";
import { recordAdminAudit } from "./admin-audit";
import { saveDirectoryEntry, type DirectoryKind } from "./directory-entries";
import { isSubmissionImagePath } from "./submission-picture";

import {
  approvalTitle,
  parseApprovalTab,
  type ApprovalCounts,
  type ApprovalRow,
  type ApprovalTab,
} from "./admin-approvals-types";

export { approvalTitle, parseApprovalTab };
export type { ApprovalCounts, ApprovalRow, ApprovalTab };


const FULL =
  "id, kind, status, sender_email, event_name, city, dates, venue, product_name, business_name, offer, category, note, latitude, longitude, public_link, image_path, review_note, reviewed_at, reviewed_by, published_slug, created_at";
const MID =
  "id, kind, status, sender_email, event_name, city, dates, venue, product_name, business_name, offer, category, note, latitude, longitude, public_link, image_path, created_at";
const BASE =
  "id, kind, status, sender_email, event_name, city, dates, venue, product_name, business_name, offer, public_link, created_at";

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapRow(row: Record<string, unknown>): ApprovalRow | null {
  if (typeof row.id !== "string" || typeof row.kind !== "string" || typeof row.sender_email !== "string") {
    return null;
  }
  const status = row.status === "approved" || row.status === "rejected" ? row.status : "unpublished";
  const rawPath = typeof row.image_path === "string" ? row.image_path.trim() : "";
  const readable = rawPath !== "" && isSubmissionImagePath(rawPath);
  return {
    id: row.id,
    kind: row.kind,
    status,
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
    review_note: textOrNull(row.review_note),
    reviewed_at: textOrNull(row.reviewed_at),
    reviewed_by: textOrNull(row.reviewed_by),
    published_slug: textOrNull(row.published_slug),
    created_at: typeof row.created_at === "string" ? row.created_at : "",
  };
}

export function slugFromApproval(row: ApprovalRow) {
  if (row.published_slug) return row.published_slug;
  const base = [row.kind, row.city, approvalTitle(row)].filter(Boolean).join("-");
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function cityCountry(city: string | null): { country: string; city: string } | null {
  if (!city) return null;
  const name = city.trim();
  const map: Record<string, string> = {
    Lagos: "Nigeria",
    Accra: "Ghana",
    Calabar: "Nigeria",
    Abuja: "Nigeria",
    "Port Harcourt": "Nigeria",
    Kumasi: "Ghana",
  };
  const country = map[name];
  if (!country) return { country: "Nigeria", city: name };
  return { country, city: name };
}

export function entryKindForSubmission(kind: string): DirectoryKind | null {
  if (kind === "event") return "event";
  if (kind === "place" || kind === "business") return "place";
  if (kind === "placement" || kind === "product" || kind === "booking" || kind === "transportation") {
    return "placement";
  }
  return null;
}

export function payloadFromApproval(row: ApprovalRow): Record<string, unknown> {
  const kind = entryKindForSubmission(row.kind);
  if (kind === "event") {
    const name = row.event_name || "Event";
    const venue = row.venue ? `, ${row.venue}` : "";
    return {
      region: row.city || "Lagos",
      when: row.dates || "",
      summary: `${name}${venue}.`.replace("..", "."),
      url: row.public_link || "",
      urlLabel: "Submitted link",
    };
  }
  if (kind === "place") {
    const loc = cityCountry(row.city);
    return {
      name: row.business_name || approvalTitle(row),
      city: loc?.city || row.city || "",
      country: loc?.country || "",
      category: row.category || "Practical stops",
      url: row.public_link || "",
      detail: row.note || undefined,
    };
  }
  return {
    business_name: row.business_name || approvalTitle(row),
    public_link: row.public_link || "",
    offer: row.offer || undefined,
    city: row.city || undefined,
    category: row.category || undefined,
  };
}

export async function approvalCounts(): Promise<{
  reason: "ok" | "no-key" | "forbidden" | "error";
  counts: ApprovalCounts;
}> {
  const empty = { pending: 0, approved: 0, rejected: 0 };
  const gate = await requireAdminService();
  if (!gate.ok) return { reason: gate.reason, counts: empty };
  try {
    const [pending, approved, rejected] = await Promise.all([
      gate.supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "unpublished"),
      gate.supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "approved"),
      gate.supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    ]);
    if (pending.error) {
      console.error("approval counts", pending.error.message ?? pending.error);
      return { reason: "error", counts: empty };
    }
    return {
      reason: "ok",
      counts: {
        pending: pending.count ?? 0,
        approved: approved.error ? 0 : (approved.count ?? 0),
        rejected: rejected.error ? 0 : (rejected.count ?? 0),
      },
    };
  } catch (error) {
    console.error("approval counts", error);
    return { reason: "error", counts: empty };
  }
}

export async function listApprovals(options: {
  tab: ApprovalTab;
  kind?: string;
  q?: string;
}): Promise<{
  reason: "ok" | "no-key" | "forbidden" | "error";
  rows: ApprovalRow[];
  needsReviewColumns: boolean;
}> {
  const gate = await requireAdminService();
  if (!gate.ok) return { reason: gate.reason, rows: [], needsReviewColumns: false };
  const status = options.tab === "pending" ? "unpublished" : options.tab;
  const selects = [FULL, MID, BASE];
  let lastError: { code?: string; message?: string } | null = null;
  let usedFull = false;
  for (const columns of selects) {
    let query = gate.supabase.from("submissions").select(columns).eq("status", status).order("created_at", { ascending: false }).limit(200);
    if (options.kind) query = query.eq("kind", options.kind);
    const { data, error } = await query;
    if (!error && data) {
      usedFull = columns === FULL;
      let rows = data.flatMap((row) => {
        const mapped = mapRow(row as unknown as Record<string, unknown>);
        return mapped ? [mapped] : [];
      });
      const q = options.q?.trim().toLowerCase();
      if (q) {
        rows = rows.filter((row) =>
          [
            row.event_name,
            row.business_name,
            row.product_name,
            row.city,
            row.venue,
            row.sender_email,
            row.kind,
            row.offer,
            row.note,
            row.public_link,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q),
        );
      }
      return { reason: "ok", rows, needsReviewColumns: !usedFull };
    }
    lastError = error;
    if (!isMissingColumnError(error) && !isMissingRelationError(error)) break;
  }
  console.error("listApprovals", lastError?.message ?? lastError);
  return { reason: "error", rows: [], needsReviewColumns: false };
}

export type ApprovalActionInput = {
  ids: string[];
  decision: "approved" | "rejected";
  note?: string | null;
  edits?: Partial<
    Pick<
      ApprovalRow,
      | "event_name"
      | "city"
      | "dates"
      | "venue"
      | "business_name"
      | "product_name"
      | "offer"
      | "category"
      | "public_link"
      | "note"
    >
  >;
};

export async function decideApprovals(input: ApprovalActionInput): Promise<{
  ok: boolean;
  message: string;
  needsMigration?: boolean;
}> {
  const gate = await requireAdminService();
  if (!gate.ok) return { ok: false, message: gate.message };
  const ids = [...new Set(input.ids.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) return { ok: false, message: "Select at least one submission." };
  const note = input.note?.trim() || null;
  if (note && note.length > 1000) return { ok: false, message: "Keep the review note under 1,000 characters." };

  const { data, error } = await gate.supabase.from("submissions").select(FULL).in("id", ids);
  const fallback = error && isMissingColumnError(error)
    ? await gate.supabase.from("submissions").select(MID).in("id", ids)
    : null;
  const rowsData = fallback ? fallback.data : data;
  const readError = fallback ? fallback.error : error;
  if (readError || !rowsData) {
    if (readError && isMissingColumnError(readError)) {
      return {
        ok: false,
        message: "Approvals need a database update before a status can change.",
        needsMigration: true,
      };
    }
    console.error("decideApprovals read", readError?.message ?? readError);
    return { ok: false, message: "Those submissions could not be read." };
  }
  const rows = rowsData.flatMap((row) => {
    const mapped = mapRow(row as unknown as Record<string, unknown>);
    return mapped ? [mapped] : [];
  });
  if (rows.length === 0) return { ok: false, message: "Those submissions could not be found." };

  let published = 0;
  let decided = 0;
  for (const raw of rows) {
    const row: ApprovalRow = { ...raw, ...input.edits };
    const slug = slugFromApproval(row);
    const patch: Record<string, unknown> = {
      status: input.decision,
      updated_at: new Date().toISOString(),
    };
    if (input.edits) {
      for (const [key, value] of Object.entries(input.edits)) {
        if (value !== undefined) patch[key] = value;
      }
    }
    // Review columns may be missing until the migration is applied.
    patch.review_note = note;
    patch.reviewed_at = new Date().toISOString();
    patch.reviewed_by = gate.email;
    if (input.decision === "approved") patch.published_slug = slug;

    const { error: writeError } = await gate.supabase.from("submissions").update(patch).eq("id", row.id);
    if (writeError) {
      if (isMissingColumnError(writeError) || (writeError.message ?? "").includes("submissions_status_check")) {
        return {
          ok: false,
          message: "Approvals need a database update before a status can change.",
          needsMigration: true,
        };
      }
      console.error("decideApprovals write", writeError.message ?? writeError);
      return { ok: false, message: "A submission could not be updated." };
    }
    decided += 1;

    const kind = entryKindForSubmission(row.kind);
    if (input.decision === "approved" && kind) {
      const saved = await saveDirectoryEntry({
        kind,
        slug,
        title: approvalTitle(row),
        status: "published",
        source: "submission",
        payload: payloadFromApproval(row),
        submission_id: row.id,
      });
      if (saved.ok) published += 1;
    }
    await recordAdminAudit(gate.supabase, {
      actorEmail: gate.email,
      action: input.decision === "approved" ? "submission.approve" : "submission.reject",
      entityType: "submission",
      entityId: row.id,
      summary: `${input.decision === "approved" ? "Approved" : "Rejected"} ${row.kind} “${approvalTitle(row)}”.`,
      payload: { note, kind: row.kind, slug },
    });
  }

  if (input.decision === "approved") {
    const extra = published > 0 ? ` ${published} can now appear on the site.` : "";
    return { ok: true, message: `Approved ${decided}.${extra}` };
  }
  return { ok: true, message: `Rejected ${decided}.` };
}
