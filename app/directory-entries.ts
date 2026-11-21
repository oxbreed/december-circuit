import "server-only";
import { cacheLife } from "next/cache";
import { cache } from "react";
import { isMissingRelationError, requireAdminService } from "./admin-guard";
import { recordAdminAudit } from "./admin-audit";
import type { CircuitEvent } from "./events";
import { eventSlug } from "./event-view";
import type { FramePhoto } from "./landmarks";
import type { Place } from "./places";
import { placeSlug } from "./place-catalog";
import type { HomeFeatureKey } from "./home-featured";

export const directoryKinds = ["event", "place", "landmark", "featured", "placement"] as const;
export type DirectoryKind = (typeof directoryKinds)[number];

export const directoryStatuses = ["draft", "published", "unpublished", "scheduled"] as const;
export type DirectoryStatus = (typeof directoryStatuses)[number];

export type DirectoryEntry = {
  id: string;
  kind: DirectoryKind;
  slug: string;
  title: string;
  status: DirectoryStatus;
  source: "seed" | "submission" | "admin";
  payload: Record<string, unknown>;
  sort_order: number;
  publish_at: string | null;
  unpublish_at: string | null;
  submission_id: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EntriesResult = {
  reason: "ok" | "no-key" | "forbidden" | "needs-migration" | "error";
  rows: DirectoryEntry[];
};

const SELECT =
  "id, kind, slug, title, status, source, payload, sort_order, publish_at, unpublish_at, submission_id, updated_by, created_at, updated_at";

function asEntry(row: Record<string, unknown>): DirectoryEntry | null {
  if (
    typeof row.id !== "string" ||
    typeof row.kind !== "string" ||
    typeof row.slug !== "string" ||
    typeof row.title !== "string" ||
    typeof row.status !== "string"
  ) {
    return null;
  }
  if (!(directoryKinds as readonly string[]).includes(row.kind)) return null;
  if (!(directoryStatuses as readonly string[]).includes(row.status)) return null;
  const payload =
    row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
      ? (row.payload as Record<string, unknown>)
      : {};
  return {
    id: row.id,
    kind: row.kind as DirectoryKind,
    slug: row.slug,
    title: row.title,
    status: row.status as DirectoryStatus,
    source: row.source === "seed" || row.source === "submission" || row.source === "admin" ? row.source : "admin",
    payload,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    publish_at: typeof row.publish_at === "string" ? row.publish_at : null,
    unpublish_at: typeof row.unpublish_at === "string" ? row.unpublish_at : null,
    submission_id: typeof row.submission_id === "string" ? row.submission_id : null,
    updated_by: typeof row.updated_by === "string" ? row.updated_by : null,
    created_at: typeof row.created_at === "string" ? row.created_at : "",
    updated_at: typeof row.updated_at === "string" ? row.updated_at : "",
  };
}

export function isLiveNow(entry: Pick<DirectoryEntry, "status" | "publish_at" | "unpublish_at">, now = Date.now()) {
  if (entry.status === "unpublished" || entry.status === "draft") return false;
  if (entry.status !== "published" && entry.status !== "scheduled") return false;
  if (entry.publish_at) {
    const start = Date.parse(entry.publish_at);
    if (!Number.isNaN(start) && start > now) return false;
  } else if (entry.status === "scheduled") {
    return false;
  }
  if (entry.unpublish_at) {
    const end = Date.parse(entry.unpublish_at);
    if (!Number.isNaN(end) && end <= now) return false;
  }
  return true;
}

export function isHiddenOverlay(entry: Pick<DirectoryEntry, "status" | "publish_at" | "unpublish_at">, now = Date.now()) {
  if (entry.status === "unpublished") return true;
  if (entry.status === "draft") return true;
  return !isLiveNow(entry, now) && entry.status !== "published" && entry.status !== "scheduled"
    ? false
    : entry.status === "published" && !isLiveNow(entry, now);
}

async function loadAllEntries(): Promise<EntriesResult> {
  const gate = await requireAdminService();
  if (!gate.ok) return { reason: gate.reason, rows: [] };
  const { data, error } = await gate.supabase
    .from("directory_entries")
    .select(SELECT)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(2000);
  if (error) {
    if (isMissingRelationError(error)) return { reason: "needs-migration", rows: [] };
    console.error("directory_entries list", error.message ?? error);
    return { reason: "error", rows: [] };
  }
  return {
    reason: "ok",
    rows: (data ?? []).flatMap((row) => {
      const entry = asEntry(row as Record<string, unknown>);
      return entry ? [entry] : [];
    }),
  };
}

export const listDirectoryEntries = cache(async (kind?: DirectoryKind): Promise<EntriesResult> => {
  const result = await loadAllEntries();
  if (!kind || result.reason !== "ok") return result;
  return { ...result, rows: result.rows.filter((row) => row.kind === kind) };
});

async function loadPublicDirectoryEntries(): Promise<DirectoryEntry[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });
  try {
    const { createServiceClient } = await import("./supabase/server");
    const supabase = createServiceClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("directory_entries")
      .select(SELECT)
      .limit(2000);
    if (error) {
      if (!isMissingRelationError(error)) console.error("directory_entries public", error.message ?? error);
      return [];
    }
    return (data ?? []).flatMap((row) => {
      const entry = asEntry(row as Record<string, unknown>);
      return entry ? [entry] : [];
    });
  } catch (error) {
    console.error("directory_entries public", error);
    return [];
  }
}

/** Public, unauthenticated merge: service role, fail soft, no admin email required. */
export const listPublicDirectoryEntries = cache(loadPublicDirectoryEntries);

function text(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function optional(payload: Record<string, unknown>, key: string) {
  const value = text(payload, key);
  return value || undefined;
}

export function eventFromEntry(entry: DirectoryEntry): CircuitEvent | null {
  const region = text(entry.payload, "region");
  const when = text(entry.payload, "when");
  const summary = text(entry.payload, "summary");
  if (!region || !when || !summary) return null;
  const event: CircuitEvent = {
    region,
    when,
    summary,
    url: optional(entry.payload, "url"),
    urlLabel: optional(entry.payload, "urlLabel"),
    ticketsUrl: optional(entry.payload, "ticketsUrl"),
    sourceId: optional(entry.payload, "sourceId") ?? `cms:${entry.slug}`,
    slug: entry.slug,
  };
  return event;
}

export function placeFromEntry(entry: DirectoryEntry): Place | null {
  const country = text(entry.payload, "country");
  const city = text(entry.payload, "city");
  const category = text(entry.payload, "category");
  const name = text(entry.payload, "name") || entry.title;
  const url = text(entry.payload, "url");
  if (!country || !city || !category || !name || !url) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  const place: Place = {
    country,
    city,
    category,
    name,
    url,
    area: optional(entry.payload, "area"),
    detail: optional(entry.payload, "detail"),
    source: optional(entry.payload, "source"),
    checked: optional(entry.payload, "checked"),
    slug: entry.slug,
  };
  return place;
}

export function landmarkFromEntry(entry: DirectoryEntry): FramePhoto | null {
  const name = text(entry.payload, "name") || entry.title;
  const city = text(entry.payload, "city");
  const src = text(entry.payload, "src");
  const credit = text(entry.payload, "credit");
  if (!name || !city || !src || !credit) return null;
  if (!(src.startsWith("/landmarks/") || /^https?:\/\//i.test(src))) return null;
  return {
    name,
    city,
    src,
    alt: optional(entry.payload, "alt"),
    credit,
    creditUrl: optional(entry.payload, "creditUrl"),
  };
}

export function featuredKeyFromEntry(entry: DirectoryEntry): HomeFeatureKey | null {
  const artist = text(entry.payload, "artist");
  const title = text(entry.payload, "title") || entry.title;
  const date = text(entry.payload, "date");
  const sourceId = text(entry.payload, "sourceId");
  const poster = text(entry.payload, "poster");
  if (!artist || !title || !date || !sourceId || !poster) return null;
  return {
    id: entry.slug,
    artist,
    title,
    date,
    sourceId,
    when: optional(entry.payload, "when"),
    poster,
  };
}

export function placementFromEntry(entry: DirectoryEntry) {
  const name = text(entry.payload, "business_name") || entry.title;
  const url = text(entry.payload, "public_link") || text(entry.payload, "url");
  if (!name || !url || !/^https?:\/\//i.test(url)) return null;
  return {
    slug: entry.slug,
    name,
    url,
    offer: optional(entry.payload, "offer") ?? null,
    city: optional(entry.payload, "city") ?? null,
    category: optional(entry.payload, "category") ?? null,
  };
}

export function mergeEventsWithEntries(seed: CircuitEvent[], entries: DirectoryEntry[]): CircuitEvent[] {
  const now = Date.now();
  const bySlug = new Map<string, DirectoryEntry>();
  for (const entry of entries.filter((row) => row.kind === "event")) {
    bySlug.set(entry.slug, entry);
  }
  const used = new Set<string>();
  const merged: CircuitEvent[] = [];
  for (const event of seed) {
    const slug = event.slug ?? eventSlug(event);
    const overlay = bySlug.get(slug);
    if (overlay) {
      used.add(slug);
      if (overlay.status === "unpublished" || overlay.status === "draft") continue;
      if (!isLiveNow(overlay, now)) continue;
      const next = eventFromEntry(overlay);
      if (next) merged.push(next);
      else merged.push(event);
    } else {
      merged.push(event);
    }
  }
  for (const entry of entries.filter((row) => row.kind === "event")) {
    if (used.has(entry.slug)) continue;
    if (!isLiveNow(entry, now)) continue;
    const next = eventFromEntry(entry);
    if (next) merged.push(next);
  }
  return merged;
}

export function mergePlacesWithEntries(seed: Place[], entries: DirectoryEntry[]): Place[] {
  const now = Date.now();
  const bySlug = new Map<string, DirectoryEntry>();
  for (const entry of entries.filter((row) => row.kind === "place")) {
    bySlug.set(entry.slug, entry);
  }
  const used = new Set<string>();
  const merged: Place[] = [];
  for (const place of seed) {
    const slug = place.slug ?? placeSlug(place);
    const overlay = bySlug.get(slug);
    if (overlay) {
      used.add(slug);
      if (overlay.status === "unpublished" || overlay.status === "draft") continue;
      if (!isLiveNow(overlay, now)) continue;
      const next = placeFromEntry(overlay);
      if (next) merged.push(next);
      else merged.push(place);
    } else {
      merged.push(place);
    }
  }
  for (const entry of entries.filter((row) => row.kind === "place")) {
    if (used.has(entry.slug)) continue;
    if (!isLiveNow(entry, now)) continue;
    const next = placeFromEntry(entry);
    if (next) merged.push(next);
  }
  return merged;
}

export function mergeLandmarksWithEntries(seed: FramePhoto[], entries: DirectoryEntry[]): FramePhoto[] {
  const now = Date.now();
  const hidden = new Set(
    entries
      .filter((row) => row.kind === "landmark" && (row.status === "unpublished" || row.status === "draft"))
      .map((row) => row.slug),
  );
  const overlays = new Map<string, FramePhoto>();
  const extras: FramePhoto[] = [];
  for (const entry of entries.filter((row) => row.kind === "landmark")) {
    if (!isLiveNow(entry, now)) continue;
    const shot = landmarkFromEntry(entry);
    if (!shot) continue;
    const match = seed.find((row) => row.src === entry.slug || row.src === shot.src);
    if (match) overlays.set(match.src, shot);
    else extras.push(shot);
  }
  const kept = seed
    .filter((row) => !hidden.has(row.src))
    .map((row) => overlays.get(row.src) ?? row);
  // New landmarks append after the seed list, never prepend.
  return [...kept, ...extras];
}

export function mergeFeaturedWithEntries(
  seed: readonly HomeFeatureKey[],
  entries: DirectoryEntry[],
): HomeFeatureKey[] {
  const now = Date.now();
  const hidden = new Set(
    entries
      .filter((row) => row.kind === "featured" && (row.status === "unpublished" || row.status === "draft"))
      .map((row) => row.slug),
  );
  const live = entries
    .filter((row) => row.kind === "featured" && isLiveNow(row, now))
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
  if (live.length === 0) return seed.filter((row) => !hidden.has(row.id));
  const byId = new Map(seed.map((row) => [row.id, row]));
  const used = new Set<string>();
  const merged: HomeFeatureKey[] = [];
  for (const entry of live) {
    const fromEntry = featuredKeyFromEntry(entry);
    const fromSeed = byId.get(entry.slug);
    const next = fromEntry ?? fromSeed;
    if (!next) continue;
    used.add(next.id);
    merged.push(next);
  }
  for (const row of seed) {
    if (used.has(row.id) || hidden.has(row.id)) continue;
    merged.push(row);
  }
  return merged;
}

export type EntryInput = {
  id?: string;
  kind: DirectoryKind;
  slug: string;
  title: string;
  status: DirectoryStatus;
  source?: DirectoryEntry["source"];
  payload: Record<string, unknown>;
  sort_order?: number;
  publish_at?: string | null;
  unpublish_at?: string | null;
  submission_id?: string | null;
};

export async function saveDirectoryEntry(input: EntryInput): Promise<{
  ok: boolean;
  message: string;
  entry?: DirectoryEntry;
}> {
  const gate = await requireAdminService();
  if (!gate.ok) return { ok: false, message: gate.message };
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const title = input.title.trim();
  if (!slug || !title) return { ok: false, message: "A slug and a title are required." };
  if (!(directoryKinds as readonly string[]).includes(input.kind)) {
    return { ok: false, message: "That content type is not supported." };
  }
  if (input.kind === "event") {
    if (!text(input.payload, "region") || !text(input.payload, "when") || !text(input.payload, "summary") || !text(input.payload, "url")) {
      return { ok: false, message: "An event needs a city or region, dates, a summary, and a source URL." };
    }
  }
  if (input.kind === "place") {
    if (!text(input.payload, "country") || !text(input.payload, "city") || !text(input.payload, "category") || !text(input.payload, "name") || !text(input.payload, "url")) {
      return { ok: false, message: "A place needs a name, city, country, category, and source URL." };
    }
  }
  if (input.kind === "landmark") {
    if (!text(input.payload, "name") || !text(input.payload, "city") || !text(input.payload, "src") || !text(input.payload, "credit")) {
      return { ok: false, message: "A landmark needs a name, city, image path or URL, and a credit." };
    }
  }
  const row = {
    kind: input.kind,
    slug,
    title,
    status: input.status,
    source: input.source ?? "admin",
    payload: input.payload,
    sort_order: input.sort_order ?? 0,
    publish_at: input.publish_at || null,
    unpublish_at: input.unpublish_at || null,
    submission_id: input.submission_id || null,
    updated_by: gate.email,
    updated_at: new Date().toISOString(),
  };
  const query = input.id
    ? gate.supabase.from("directory_entries").update(row).eq("id", input.id).select(SELECT).maybeSingle()
    : gate.supabase.from("directory_entries").insert(row).select(SELECT).maybeSingle();
  const { data, error } = await query;
  if (error) {
    if (isMissingRelationError(error)) {
      return { ok: false, message: "This action needs the control panel database update." };
    }
    console.error("directory_entries save", error.message ?? error);
    return { ok: false, message: "The record could not be saved." };
  }
  const entry = data ? asEntry(data as Record<string, unknown>) : null;
  await recordAdminAudit(gate.supabase, {
    actorEmail: gate.email,
    action: input.id ? "entry.update" : "entry.create",
    entityType: input.kind,
    entityId: entry?.id ?? slug,
    summary: `${input.id ? "Updated" : "Created"} ${input.kind} “${title}” (${input.status}).`,
  });
  return { ok: true, message: "Saved.", entry: entry ?? undefined };
}

export async function setDirectoryEntryStatus(
  id: string,
  status: DirectoryStatus,
): Promise<{ ok: boolean; message: string }> {
  const gate = await requireAdminService();
  if (!gate.ok) return { ok: false, message: gate.message };
  const { data, error } = await gate.supabase
    .from("directory_entries")
    .update({ status, updated_by: gate.email, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, kind, title, slug")
    .maybeSingle();
  if (error) {
    if (isMissingRelationError(error)) {
      return { ok: false, message: "This action needs the control panel database update." };
    }
    console.error("directory_entries status", error.message ?? error);
    return { ok: false, message: "The status could not be updated." };
  }
  if (!data) return { ok: false, message: "That record was not found." };
  await recordAdminAudit(gate.supabase, {
    actorEmail: gate.email,
    action: "entry.status",
    entityType: String(data.kind),
    entityId: id,
    summary: `Set ${data.kind} “${data.title}” to ${status}.`,
  });
  return { ok: true, message: `Status set to ${status}.` };
}

export async function setDirectorySortOrder(
  id: string,
  sort_order: number,
): Promise<{ ok: boolean; message: string }> {
  const gate = await requireAdminService();
  if (!gate.ok) return { ok: false, message: gate.message };
  const { error } = await gate.supabase
    .from("directory_entries")
    .update({ sort_order, updated_by: gate.email, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    if (isMissingRelationError(error)) {
      return { ok: false, message: "This action needs the control panel database update." };
    }
    console.error("directory_entries sort", error.message ?? error);
    return { ok: false, message: "The order could not be updated." };
  }
  await recordAdminAudit(gate.supabase, {
    actorEmail: gate.email,
    action: "entry.reorder",
    entityType: "directory_entry",
    entityId: id,
    summary: `Moved a record to position ${sort_order}.`,
  });
  return { ok: true, message: "Order updated." };
}
