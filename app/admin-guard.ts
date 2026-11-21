import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { directorySignIn, isAdminEmail } from "./directory-auth";
import { createServiceClient } from "./supabase/server";
import { getDirectoryUser } from "./supabase/session";

export type AdminGate =
  | { ok: true; supabase: SupabaseClient; email: string }
  | { ok: false; message: string; reason: "no-key" | "forbidden" };

/**
 * Server-side allowlist check for every admin mutation and privileged read.
 * Uses ADMIN_EMAILS / ADMIN_EMAIL plus the default operator address.
 */
export async function requireAdminService(): Promise<AdminGate> {
  const auth = directorySignIn();
  if (!auth.connected) {
    return { ok: false, reason: "no-key", message: "The directory sign-in is not connected yet." };
  }
  const user = await getDirectoryUser();
  if (!user || !isAdminEmail(user.email)) {
    return { ok: false, reason: "forbidden", message: "Access refused." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, reason: "no-key", message: "The server key is not set." };
  }
  return { ok: true, supabase, email: user.email };
}

export function isMissingRelationError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "42P01") return true;
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("schema cache") ||
    message.includes("could not find the table") ||
    message.includes("does not exist")
  );
}

export function isMissingColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code === "PGRST204" || error.code === "42703") return true;
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("schema cache") ||
    message.includes("could not find") ||
    (message.includes("column") && message.includes("does not exist"))
  );
}

export const MIGRATION_NEEDED =
  "This section needs a database update. The file is supabase/migrations/20261121020000_admin_control_panel.sql. It has not been applied. Ask Ox to apply it. The rest of the console still works.";
