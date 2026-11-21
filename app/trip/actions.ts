"use server";

import { revalidatePath } from "next/cache";
import type { TripItem } from "../components/trip-storage";
import {
  createGroupTrip,
  joinGroupTrip,
  loadAccountGroupTrips,
  loadPersonalTripForUser,
  savePersonalTripItems,
  updateSharedTrip,
} from "./server";

export type TripActionResult = { ok: boolean; message?: string; shareToken?: string };

function parseItems(raw: FormDataEntryValue | null): TripItem[] | null {
  if (typeof raw !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 500) return null;
    const items = new Map<string, TripItem>();
    for (const row of parsed) {
      if (!row || (row.kind !== "event" && row.kind !== "place")
        || typeof row.id !== "string" || !row.id.trim() || row.id.length > 200) return null;
      items.set(`${row.kind}:${row.id}`, { kind: row.kind, id: row.id });
    }
    return [...items.values()];
  } catch {
    return null;
  }
}

function getToken(formData: FormData) {
  const token = formData.get("shareToken");
  return typeof token === "string" && /^[a-z0-9]{20,64}$/.test(token) ? token : null;
}

export async function fetchCloudPersonalTrip() {
  const [items, groups] = await Promise.all([loadPersonalTripForUser(), loadAccountGroupTrips()]);
  return { items, groups };
}

export async function pushCloudPersonalTrip(_prev: TripActionResult, formData: FormData): Promise<TripActionResult> {
  const items = parseItems(formData.get("items"));
  if (!items) return { ok: false, message: "This trip could not be saved. It can hold up to 500 items." };
  return savePersonalTripItems(items);
}

export async function startGroupTrip(_prev: TripActionResult, formData: FormData): Promise<TripActionResult> {
  const raw = formData.get("title");
  const title = typeof raw === "string" ? raw.trim() : "";
  const items = parseItems(formData.get("items"));
  if (!title || title.length > 120) return { ok: false, message: "Enter a group trip name (up to 120 characters)." };
  if (!items) return { ok: false, message: "A group trip can start with up to 500 saved items." };
  return createGroupTrip(title, items);
}

export async function joinGroupTripAction(_prev: TripActionResult, formData: FormData): Promise<TripActionResult> {
  const token = getToken(formData);
  if (!token) return { ok: false, message: "This invitation is unavailable." };
  const result = await joinGroupTrip(token);
  if (result.ok) revalidatePath(`/trip/share/${token}`);
  return result;
}

export async function editGroupTripAction(_prev: TripActionResult, formData: FormData): Promise<TripActionResult> {
  const token = getToken(formData);
  const items = parseItems(formData.get("items"));
  const intent = formData.get("intent");
  if (!token || !items?.length || (intent !== "add" && (intent !== "remove" || items.length !== 1))) {
    return { ok: false, message: "Choose items to update the group trip." };
  }
  const ok = await updateSharedTrip(token, intent === "remove" ? items[0] : null, items);
  if (!ok) return { ok: false, message: "The group trip could not be updated." };
  revalidatePath(`/trip/share/${token}`);
  return { ok: true, message: "Group trip updated." };
}
