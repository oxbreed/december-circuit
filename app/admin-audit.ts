import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingRelationError, requireAdminService } from "./admin-guard";

export type AuditEntry = {
  id: string;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  summary: string;
  created_at: string;
};

export async function recordAdminAudit(
  supabase: SupabaseClient,
  entry: {
    actorEmail: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    summary: string;
    payload?: Record<string, unknown> | null;
  },
) {
  try {
    const { error } = await supabase.from("admin_audit_log").insert({
      actor_email: entry.actorEmail,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      summary: entry.summary,
      payload: entry.payload ?? null,
    });
    if (error) console.error("Admin audit insert", error.message ?? error);
  } catch (error) {
    console.error("Admin audit insert", error);
  }
}

export async function listAdminAudit(limit = 80): Promise<{
  reason: "ok" | "no-key" | "forbidden" | "needs-migration" | "error";
  rows: AuditEntry[];
}> {
  const gate = await requireAdminService();
  if (!gate.ok) return { reason: gate.reason, rows: [] };
  const { data, error } = await gate.supabase
    .from("admin_audit_log")
    .select("id, actor_email, action, entity_type, entity_id, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (isMissingRelationError(error)) return { reason: "needs-migration", rows: [] };
    console.error("Admin audit list", error.message ?? error);
    return { reason: "error", rows: [] };
  }
  return { reason: "ok", rows: (data ?? []) as AuditEntry[] };
}
