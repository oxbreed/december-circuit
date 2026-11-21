import "server-only";
import type { TripItem } from "../components/trip-storage";
import { tripCloudSync } from "../trip-cloud";
import { createDirectoryClient } from "../supabase/server";
import { getDirectoryUser } from "../supabase/session";

function mapItems(rows: { kind: string; item_id: string }[] | null | undefined): TripItem[] {
  if (!rows) return [];
  const out: TripItem[] = [];
  for (const row of rows) {
    if ((row.kind === "event" || row.kind === "place") && row.item_id) {
      out.push({ kind: row.kind, id: row.item_id });
    }
  }
  return out;
}

export async function loadPersonalTripForUser(): Promise<TripItem[] | null> {
  if (!tripCloudSync().connected) return null;
  const user = await getDirectoryUser();
  if (!user) return null;
  const supabase = await createDirectoryClient();
  if (!supabase) return null;

  const { data: lists, error: listError } = await supabase
    .from("trip_lists")
    .select("id, title, is_group, share_token")
    .eq("owner_id", user.id)
    .eq("is_group", false)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (listError) return null;

  const list = lists?.[0];
  if (!list) return [];

  const { data, error } = await supabase
    .from("trip_list_items")
    .select("kind, item_id")
    .eq("list_id", list.id)
    .order("sort_order", { ascending: true });
  return error ? null : mapItems(data);
}

export async function savePersonalTripItems(items: TripItem[]) {
  const supabase = await createDirectoryClient();
  if (!supabase || !(await getDirectoryUser())) {
    return { ok: false, message: "Sign in to save your trip to your account." };
  }

  const { error } = await supabase.rpc("trip_write", { p_items: items });
  return error
    ? { ok: false, message: "Could not save your account trip. Your browser saves are still here." }
    : { ok: true, message: "Trip saved to your account." };
}

export async function loadAccountGroupTrips() {
  const supabase = await createDirectoryClient();
  if (!supabase || !(await getDirectoryUser())) return [];
  const { data } = await supabase.from("trip_lists").select("title, share_token")
    .eq("is_group", true).not("share_token", "is", null)
    .order("updated_at", { ascending: false });
  return (data ?? []).filter((row): row is { title: string; share_token: string } => Boolean(row.share_token));
}

function randomShareToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

export async function createGroupTrip(title: string, items: TripItem[]) {
  const supabase = await createDirectoryClient();
  if (!supabase || !(await getDirectoryUser())) {
    return { ok: false as const, message: "Sign in to start a group trip." };
  }

  const shareToken = randomShareToken();
  const { error } = await supabase.rpc("trip_write", {
    p_title: title,
    p_items: items,
    p_token: shareToken,
  });
  return error
    ? { ok: false as const, message: "Could not create the group trip. Try again shortly." }
    : { ok: true as const, shareToken };
}

export async function joinGroupTrip(shareToken: string): Promise<{ ok: boolean; message?: string }> {
  if (!tripCloudSync().connected) {
    return { ok: false, message: "Cloud sync is not configured." };
  }
  const user = await getDirectoryUser();
  if (!user) return { ok: false, message: "Sign in to join this group trip." };
  const supabase = await createDirectoryClient();
  if (!supabase) return { ok: false, message: "Cloud sync is not connected." };

  const { data, error } = await supabase.rpc("trip_join_by_token", { p_token: shareToken });
  if (error) return { ok: false, message: "Could not join this group trip. Try again shortly." };
  if (!data) return { ok: false, message: "This invitation is no longer available." };
  return { ok: true };
}

export type SharedTripSnapshot = {
  title: string;
  isGroup: boolean;
  items: TripItem[];
  listId: string;
};

export async function loadSharedTripByToken(shareToken: string): Promise<SharedTripSnapshot | null> {
  if (!tripCloudSync().connected) return null;
  const supabase = await createDirectoryClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("trip_shared_snapshot", { p_token: shareToken });
  if (error || !data || typeof data !== "object") return null;
  const row = data as {
    id?: string;
    title?: string;
    is_group?: boolean;
    items?: { kind: string; id: string }[];
  };
  if (!row.id || !row.title) return null;
  const items: TripItem[] = [];
  if (Array.isArray(row.items)) {
    for (const item of row.items) {
      if ((item.kind === "event" || item.kind === "place") && item.id) {
        items.push({ kind: item.kind, id: item.id });
      }
    }
  }
  return {
    listId: row.id,
    title: row.title,
    isGroup: Boolean(row.is_group),
    items,
  };
}

export async function canEditSharedList(listId: string): Promise<boolean> {
  const user = await getDirectoryUser();
  if (!user) return false;
  const supabase = await createDirectoryClient();
  if (!supabase) return false;
  const { data: list } = await supabase.from("trip_lists").select("owner_id").eq("id", listId).maybeSingle();
  if (list?.owner_id === user.id) return true;
  const { data: member } = await supabase
    .from("trip_list_members")
    .select("role")
    .eq("list_id", listId)
    .eq("user_id", user.id)
    .maybeSingle();
  return Boolean(member && (member.role === "owner" || member.role === "editor"));
}
export async function updateSharedTrip(shareToken: string, remove: TripItem | null, add: TripItem[]) {
  const trip = await loadSharedTripByToken(shareToken);
  if (!trip || !(await canEditSharedList(trip.listId))) return false;
  const supabase = await createDirectoryClient();
  if (!supabase) return false;

  if (remove) {
    const { error } = await supabase.from("trip_list_items").delete().eq("list_id", trip.listId)
      .eq("kind", remove.kind).eq("item_id", remove.id);
    return !error;
  }

  const { error } = await supabase.from("trip_list_items").upsert(
    add.map((item) => ({ list_id: trip.listId, kind: item.kind, item_id: item.id, sort_order: 1000 })),
    { onConflict: "list_id,kind,item_id", ignoreDuplicates: true },
  );
  return !error;
}
