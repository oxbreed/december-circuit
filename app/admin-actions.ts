"use server";

import { revalidatePath } from "next/cache";
import { decideApprovals } from "./admin-approvals";
import {
  saveDirectoryEntry,
  setDirectoryEntryStatus,
  setDirectorySortOrder,
  type DirectoryKind,
  type DirectoryStatus,
} from "./directory-entries";

export type AdminActionState = {
  status: "idle" | "ok" | "error";
  message?: string;
};

function idsFromForm(formData: FormData) {
  const many = formData.getAll("ids").map((value) => String(value).trim()).filter(Boolean);
  const single = String(formData.get("id") ?? "").trim();
  if (single) many.push(single);
  return [...new Set(many)];
}

function revalidatePublic() {
  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath("/places");
  revalidatePath("/get-featured");
  revalidatePath("/");
}

export async function approveSubmissions(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const note = String(formData.get("review_note") ?? "").trim() || null;
  const result = await decideApprovals({
    ids: idsFromForm(formData),
    decision: "approved",
    note,
    edits: optionalEdits(formData),
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePublic();
  return { status: "ok", message: result.message };
}

export async function rejectSubmissions(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const note = String(formData.get("review_note") ?? "").trim() || null;
  const result = await decideApprovals({
    ids: idsFromForm(formData),
    decision: "rejected",
    note,
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePublic();
  return { status: "ok", message: result.message };
}

function optionalEdits(formData: FormData) {
  const keys = [
    "event_name",
    "city",
    "dates",
    "venue",
    "business_name",
    "product_name",
    "offer",
    "category",
    "public_link",
    "note",
  ] as const;
  const edits: Record<string, string> = {};
  for (const key of keys) {
    if (!formData.has(key)) continue;
    edits[key] = String(formData.get(key) ?? "").trim();
  }
  return Object.keys(edits).length ? edits : undefined;
}

function asKind(value: string): DirectoryKind | null {
  if (value === "event" || value === "place" || value === "landmark" || value === "featured" || value === "placement") {
    return value;
  }
  return null;
}

function asStatus(value: string): DirectoryStatus | null {
  if (value === "draft" || value === "published" || value === "unpublished" || value === "scheduled") {
    return value;
  }
  return null;
}

export async function saveContentEntry(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const kind = asKind(String(formData.get("kind") ?? ""));
  const status = asStatus(String(formData.get("status") ?? "draft")) ?? "draft";
  if (!kind) return { status: "error", message: "That content type is not supported." };
  const payload: Record<string, unknown> = {};
  for (const [key, raw] of formData.entries()) {
    if (key.startsWith("payload.")) {
      const value = String(raw).trim();
      if (value) payload[key.slice("payload.".length)] = value;
    }
  }
  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const sort_order = sortRaw ? Number.parseInt(sortRaw, 10) : 0;
  const result = await saveDirectoryEntry({
    id: String(formData.get("id") ?? "").trim() || undefined,
    kind,
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    status,
    payload,
    sort_order: Number.isFinite(sort_order) ? sort_order : 0,
    publish_at: String(formData.get("publish_at") ?? "").trim() || null,
    unpublish_at: String(formData.get("unpublish_at") ?? "").trim() || null,
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePublic();
  return { status: "ok", message: result.message };
}

export async function setContentStatus(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = String(formData.get("id") ?? "").trim();
  const status = asStatus(String(formData.get("status") ?? ""));
  if (!id || !status) return { status: "error", message: "A record and a status are required." };
  const result = await setDirectoryEntryStatus(id, status);
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePublic();
  return { status: "ok", message: result.message };
}

export async function setContentOrder(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = String(formData.get("id") ?? "").trim();
  const sort_order = Number.parseInt(String(formData.get("sort_order") ?? ""), 10);
  if (!id || !Number.isFinite(sort_order)) {
    return { status: "error", message: "A record and a position are required." };
  }
  const result = await setDirectorySortOrder(id, sort_order);
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePublic();
  return { status: "ok", message: result.message };
}
