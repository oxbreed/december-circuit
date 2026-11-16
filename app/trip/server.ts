import "server-only";
import type { TripItem } from "../components/trip-storage";
import { tripCloudSync } from "../trip-cloud";
import { createDirectoryClient } from "../supabase/server";
import { getDirectoryUser } from "../supabase/session";

export type TripListSummary = {
  id: string;
  title: string;
  isGroup: boolean;
  shareToken: string | null;
  items: TripItem[];
};

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

export async function loadPersonalTripForUser(): Promise<TripListSummary | null> {
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

  let list = lists?.[0];
  if (!list) {
    const { data: created, error: createError } = await supabase
      .from("trip_lists")
      .insert({ owner_id: user.id, title: "My trip", is_group: false })
      .select("id, title, is_group, share_token")
      .single();
    if (createError || !created) return null;
    list = created;
  }

  const { data: itemRows } = await supabase
    .from("trip_list_items")
    .select("kind, item_id")
    .eq("list_id", list.id)
    .order("sort_order", { ascending: true });

  return {
    id: list.id,
    title: list.title,
    isGroup: list.is_group,
    shareToken: list.share_token,
    items: mapItems(itemRows),
  };
}

export async function savePersonalTripItems(items: TripItem[]): Promise<{ ok: boolean; message?: string }> {
  if (!tripCloudSync().connected) {
    return { ok: false, message: "Cloud sync is not configured on this deployment." };
  }
  const user = await getDirectoryUser();
  if (!user) {
    return { ok: false, message: "Sign in to sync this trip." };
  }
  const supabase = await createDirectoryClient();
  if (!supabase) {
    return { ok: false, message: "Cloud sync is not connected." };
  }

  const trip = await loadPersonalTripForUser();
  if (!trip) {
    return { ok: false, message: "Could not open your cloud trip." };
  }

  const { error: deleteError } = await supabase.from("trip_list_items").delete().eq("list_id", trip.id);
  if (deleteError) {
    return { ok: false, message: "Could not update the cloud trip." };
  }

  if (items.length > 0) {
    const payload = items.map((item, index) => ({
      list_id: trip.id,
      kind: item.kind,
      item_id: item.id,
      sort_order: index,
    }));
    const { error: insertError } = await supabase.from("trip_list_items").insert(payload);
    if (insertError) {
      return { ok: false, message: "Could not save items to the cloud trip." };
    }
  }

  await supabase.from("trip_lists").update({ updated_at: new Date().toISOString() }).eq("id", trip.id);

  return { ok: true };
}

function randomShareToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

export async function createGroupTrip(title: string): Promise<
  { ok: true; shareToken: string; listId: string } | { ok: false; message: string }
> {
  if (!tripCloudSync().connected) {
    return { ok: false, message: "Cloud sync is not configured." };
  }
  const user = await getDirectoryUser();
  if (!user) return { ok: false, message: "Sign in to start a group trip." };
  const supabase = await createDirectoryClient();
  if (!supabase) return { ok: false, message: "Cloud sync is not connected." };

  const trimmed = title.trim().slice(0, 120) || "Group trip";
  const shareToken = randomShareToken();

  const { data, error } = await supabase
    .from("trip_lists")
    .insert({
      owner_id: user.id,
      title: trimmed,
      is_group: true,
      share_token: shareToken,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, message: "Could not create the group trip." };
  }

  const personal = await loadPersonalTripForUser();
  if (personal && personal.items.length > 0) {
    const payload = personal.items.map((item, index) => ({
      list_id: data.id,
      kind: item.kind,
      item_id: item.id,
      sort_order: index,
    }));
    await supabase.from("trip_list_items").insert(payload);
  }

  await supabase.from("trip_list_members").insert({
    list_id: data.id,
    user_id: user.id,
    role: "owner",
  });

  return { ok: true, shareToken, listId: data.id };
}

export async function joinGroupTrip(shareToken: string): Promise<{ ok: boolean; message?: string }> {
  if (!tripCloudSync().connected) {
    return { ok: false, message: "Cloud sync is not configured." };
  }
  const user = await getDirectoryUser();
  if (!user) return { ok: false, message: "Sign in to join this group trip." };
  const supabase = await createDirectoryClient();
  if (!supabase) return { ok: false, message: "Cloud sync is not connected." };

  const { data: list } = await supabase
    .from("trip_lists")
    .select("id, is_group, share_token")
    .eq("share_token", shareToken)
    .maybeSingle();

  if (!list?.is_group) {
    return { ok: false, message: "This group link is not on file." };
  }

  const { error } = await supabase.from("trip_list_members").upsert({
    list_id: list.id,
    user_id: user.id,
    role: "editor",
  });

  if (error) {
    return { ok: false, message: "Could not join this group trip." };
  }
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