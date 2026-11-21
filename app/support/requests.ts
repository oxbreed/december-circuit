import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isMissingRelationError, requireAdminService } from "../admin-guard";
import { recordAdminAudit } from "../admin-audit";
import { createServiceClient } from "../supabase/server";
import {
  isSupportStatus,
  isSupportTopic,
  type SupportStatus,
  type SupportTopic,
} from "./topics";

export const SUPPORT_MIGRATION_FILE = "supabase/migrations/20261121140000_support_requests.sql";

export const SUPPORT_MIGRATION_NEEDED =
  "This inbox needs a database update. The file is supabase/migrations/20261121140000_support_requests.sql. It has not been applied. Ask Ox to apply it. The rest of the console still works.";

export type SupportRequest = {
  id: string;
  name: string;
  email: string;
  topic: SupportTopic;
  message: string;
  status: SupportStatus;
  page_path: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportCounts = { open: number; resolved: number };

export type SupportListTab = "open" | "resolved" | "all";

export type SupportWriteResult =
  | { ok: true; id: string }
  | {
      ok: false;
      reason: "invalid" | "no-key" | "needs-migration" | "error";
      message: string;
    };

export type SupportListResult = {
  reason: "ok" | "no-key" | "forbidden" | "needs-migration" | "error";
  rows: SupportRequest[];
  counts: SupportCounts;
};

const columns =
  "id, name, email, topic, message, status, page_path, resolved_at, resolved_by, created_at, updated_at";

function devStoreEnabled() {
  const flag = process.env.SUPPORT_DEV_STORE?.trim().toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes" || flag === "on") return true;
  if (flag === "0" || flag === "false" || flag === "off" || flag === "no") return false;
  return process.env.NODE_ENV !== "production";
}

function devStorePath() {
  return path.join(process.cwd(), ".data", "support-requests.json");
}

async function readDevStore(): Promise<SupportRequest[]> {
  try {
    const raw = await readFile(devStorePath(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredRow);
  } catch {
    return [];
  }
}

async function writeDevStore(rows: SupportRequest[]) {
  const dir = path.dirname(devStorePath());
  await mkdir(dir, { recursive: true });
  await writeFile(devStorePath(), `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

function isStoredRow(value: unknown): value is SupportRequest {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<SupportRequest>;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.email === "string" &&
    typeof row.topic === "string" &&
    isSupportTopic(row.topic) &&
    typeof row.message === "string" &&
    typeof row.status === "string" &&
    isSupportStatus(row.status) &&
    typeof row.created_at === "string"
  );
}

function matchesList(
  row: SupportRequest,
  filter: { tab: SupportListTab; topic?: string; q?: string },
) {
  if (filter.tab !== "all" && row.status !== filter.tab) return false;
  if (filter.topic && row.topic !== filter.topic) return false;
  const q = filter.q?.trim().toLowerCase();
  if (!q) return true;
  const hay = `${row.name} ${row.email} ${row.message}`.toLowerCase();
  return hay.includes(q);
}

function countRows(rows: SupportRequest[]): SupportCounts {
  let open = 0;
  let resolved = 0;
  for (const row of rows) {
    if (row.status === "open") open += 1;
    else resolved += 1;
  }
  return { open, resolved };
}

async function insertDev(row: Omit<SupportRequest, "id" | "created_at" | "updated_at"> & { id?: string }) {
  const now = new Date().toISOString();
  const stored: SupportRequest = {
    ...row,
    id: row.id ?? crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  const rows = await readDevStore();
  rows.unshift(stored);
  await writeDevStore(rows);
  return stored;
}

export async function createSupportRequest(input: {
  name: string;
  email: string;
  topic: SupportTopic;
  message: string;
  pagePath: string | null;
}): Promise<SupportWriteResult> {
  const payload = {
    name: input.name,
    email: input.email,
    topic: input.topic,
    message: input.message,
    status: "open" as const,
    page_path: input.pagePath,
    resolved_at: null,
    resolved_by: null,
  };

  const supabase = createServiceClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("support_requests")
      .insert(payload)
      .select("id")
      .single();
    if (!error && data?.id) {
      return { ok: true, id: String(data.id) };
    }
    if (error && isMissingRelationError(error) && devStoreEnabled()) {
      const stored = await insertDev(payload);
      return { ok: true, id: stored.id };
    }
    if (error && isMissingRelationError(error)) {
      return { ok: false, reason: "needs-migration", message: SUPPORT_MIGRATION_NEEDED };
    }
    if (error) {
      console.error("Support request insert", error.message ?? error);
      return { ok: false, reason: "error", message: "The message could not be stored just now." };
    }
  }

  if (devStoreEnabled()) {
    const stored = await insertDev(payload);
    return { ok: true, id: stored.id };
  }

  if (!supabase) {
    return { ok: false, reason: "no-key", message: "The server key is not set, so the message could not be stored." };
  }

  return { ok: false, reason: "error", message: "The message could not be stored just now." };
}

export function parseSupportTab(value: string | string[] | undefined): SupportListTab {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "resolved" || raw === "all") return raw;
  return "open";
}

export async function listSupportRequests(filter: {
  tab?: SupportListTab;
  topic?: string;
  q?: string;
}): Promise<SupportListResult> {
  const tab = filter.tab ?? "open";
  const topic = filter.topic && isSupportTopic(filter.topic) ? filter.topic : undefined;
  const q = filter.q?.trim() || undefined;
  const empty: SupportCounts = { open: 0, resolved: 0 };

  const gate = await requireAdminService();
  if (!gate.ok) return { reason: gate.reason, rows: [], counts: empty };

  const { data, error } = await gate.supabase
    .from("support_requests")
    .select(columns)
    .order("created_at", { ascending: false })
    .limit(400);

  if (error && isMissingRelationError(error) && devStoreEnabled()) {
    const rows = await readDevStore();
    return {
      reason: "ok",
      rows: rows.filter((row) => matchesList(row, { tab, topic, q })),
      counts: countRows(rows),
    };
  }
  if (error && isMissingRelationError(error)) {
    return { reason: "needs-migration", rows: [], counts: empty };
  }
  if (error) {
    console.error("Support request list", error.message ?? error);
    return { reason: "error", rows: [], counts: empty };
  }

  const all = (data ?? []) as SupportRequest[];
  return {
    reason: "ok",
    rows: all.filter((row) => matchesList(row, { tab, topic, q })),
    counts: countRows(all),
  };
}

export async function supportRequestCounts(): Promise<{
  reason: SupportListResult["reason"];
  counts: SupportCounts;
}> {
  const listed = await listSupportRequests({ tab: "all" });
  return { reason: listed.reason, counts: listed.counts };
}

export async function setSupportRequestStatus(input: {
  id: string;
  status: SupportStatus;
}): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  const id = input.id.trim();
  if (!id) return { ok: false, message: "A request is required." };
  if (!isSupportStatus(input.status)) return { ok: false, message: "Choose open or resolved." };

  const gate = await requireAdminService();
  if (!gate.ok) return { ok: false, message: gate.message };

  const now = new Date().toISOString();
  const patch = {
    status: input.status,
    resolved_at: input.status === "resolved" ? now : null,
    resolved_by: input.status === "resolved" ? gate.email : null,
    updated_at: now,
  };

  const { data, error } = await gate.supabase
    .from("support_requests")
    .update(patch)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error && isMissingRelationError(error) && devStoreEnabled()) {
    const rows = await readDevStore();
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return { ok: false, message: "That request is not on file." };
    rows[index] = { ...rows[index], ...patch };
    await writeDevStore(rows);
    await recordAdminAudit(gate.supabase, {
      actorEmail: gate.email,
      action: input.status === "resolved" ? "resolve_support" : "reopen_support",
      entityType: "support_request",
      entityId: id,
      summary:
        input.status === "resolved"
          ? `Marked a support request from ${rows[index].email} as resolved.`
          : `Reopened a support request from ${rows[index].email}.`,
    });
    return {
      ok: true,
      message: input.status === "resolved" ? "Marked as resolved." : "Marked as open.",
    };
  }
  if (error && isMissingRelationError(error)) {
    return { ok: false, message: SUPPORT_MIGRATION_NEEDED };
  }
  if (error) {
    console.error("Support request update", error.message ?? error);
    return { ok: false, message: "The request could not be updated." };
  }
  if (!data?.id) return { ok: false, message: "That request is not on file." };

  await recordAdminAudit(gate.supabase, {
    actorEmail: gate.email,
    action: input.status === "resolved" ? "resolve_support" : "reopen_support",
    entityType: "support_request",
    entityId: id,
    summary:
      input.status === "resolved"
        ? "Marked a support request as resolved."
        : "Reopened a support request.",
  });

  return {
    ok: true,
    message: input.status === "resolved" ? "Marked as resolved." : "Marked as open.",
  };
}
