"use server";

import { revalidatePath } from "next/cache";
import { directorySignIn } from "./directory-auth";
import { createServiceClient } from "./supabase/server";
import { getDirectoryUser } from "./supabase/session";

export type ProbeActionState = {
  status: "idle" | "ok" | "error";
  message?: string;
};

async function adminService() {
  const auth = directorySignIn();
  if (!auth.connected || !auth.adminEmail) {
    return { ok: false as const, message: "The directory sign-in is not connected yet." };
  }
  const user = await getDirectoryUser();
  if (!user || user.email !== auth.adminEmail) {
    return { ok: false as const, message: "Access refused." };
  }
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false as const, message: "The server key is not set." };
  }
  return { ok: true as const, supabase };
}

export async function setWpProbeLogging(
  _prev: ProbeActionState,
  formData: FormData,
): Promise<ProbeActionState> {
  const gate = await adminService();
  if (!gate.ok) return { status: "error", message: gate.message };

  const enabled = String(formData.get("enabled") ?? "") === "1";
  const now = new Date().toISOString();
  const { data: existing } = await gate.supabase
    .from("wp_probe_settings")
    .select("id")
    .eq("id", 1)
    .maybeSingle();
  const { error } = existing
    ? await gate.supabase
        .from("wp_probe_settings")
        .update({ logging_enabled: enabled, updated_at: now })
        .eq("id", 1)
    : await gate.supabase.from("wp_probe_settings").insert({
        id: 1,
        logging_enabled: enabled,
        retention_days: 30,
        updated_at: now,
      });
  if (error) return { status: "error", message: "Logging setting could not be saved." };
  revalidatePath("/admin");
  return {
    status: "ok",
    message: enabled ? "Probe storage is on." : "Probe storage is off.",
  };
}

export async function setWpProbeRetention(
  _prev: ProbeActionState,
  formData: FormData,
): Promise<ProbeActionState> {
  const gate = await adminService();
  if (!gate.ok) return { status: "error", message: gate.message };

  const raw = String(formData.get("retention_days") ?? "").trim();
  let retentionDays: number | null = null;
  if (raw !== "") {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1 || n > 3650) {
      return { status: "error", message: "Retention must be blank or 1–3650 days." };
    }
    retentionDays = n;
  }

  const now = new Date().toISOString();
  const { data: existing } = await gate.supabase
    .from("wp_probe_settings")
    .select("id")
    .eq("id", 1)
    .maybeSingle();
  const { error } = existing
    ? await gate.supabase
        .from("wp_probe_settings")
        .update({ retention_days: retentionDays, updated_at: now })
        .eq("id", 1)
    : await gate.supabase.from("wp_probe_settings").insert({
        id: 1,
        logging_enabled: true,
        retention_days: retentionDays,
        updated_at: now,
      });
  if (error) return { status: "error", message: "Retention could not be saved." };

  if (retentionDays !== null) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    await gate.supabase.from("wp_probes").delete().lt("ts", cutoff);
  }

  revalidatePath("/admin");
  return {
    status: "ok",
    message:
      retentionDays === null
        ? "Retention cleared. Rows stay until you purge them."
        : `Retention set to ${retentionDays} days. Older rows were removed.`,
  };
}

export async function purgeWpProbes(
  _prev: ProbeActionState,
  formData: FormData,
): Promise<ProbeActionState> {
  const gate = await adminService();
  if (!gate.ok) return { status: "error", message: gate.message };

  const mode = String(formData.get("mode") ?? "").trim();
  if (mode === "all") {
    const { error } = await gate.supabase.from("wp_probes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return { status: "error", message: "Probes could not be cleared." };
    revalidatePath("/admin");
    return { status: "ok", message: "All stored probes were cleared." };
  }

  if (mode === "retention") {
    const { data, error: settingsError } = await gate.supabase
      .from("wp_probe_settings")
      .select("retention_days")
      .eq("id", 1)
      .maybeSingle();
    if (settingsError) return { status: "error", message: "Retention could not be read." };
    const days =
      typeof data?.retention_days === "number" && Number.isFinite(data.retention_days)
        ? data.retention_days
        : null;
    if (days === null) {
      return { status: "error", message: "Set a retention period before purging by age." };
    }
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await gate.supabase.from("wp_probes").delete().lt("ts", cutoff);
    if (error) return { status: "error", message: "Old probes could not be cleared." };
    revalidatePath("/admin");
    return { status: "ok", message: `Probes older than ${days} days were cleared.` };
  }

  return { status: "error", message: "Unknown purge mode." };
}
