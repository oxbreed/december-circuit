"use server";

import type { TripItem } from "../components/trip-storage";
import {
  createGroupTrip,
  joinGroupTrip,
  loadPersonalTripForUser,
  savePersonalTripItems,
} from "./server";

export type TripActionResult = { ok: boolean; message?: string; shareToken?: string };

function parseItems(raw: string): TripItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: TripItem[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const kind = (row as { kind?: unknown }).kind;
      const id = (row as { id?: unknown }).id;
      if ((kind === "event" || kind === "place") && typeof id === "string" && id.length > 0) {
        out.push({ kind, id });
      }
    }
    return out;
  } catch {
    return [];
  }
}

export async function fetchCloudPersonalTrip(): Promise<TripItem[] | null> {
  const trip = await loadPersonalTripForUser();
  if (!trip) return null;
  return trip.items;
}

export async function pushCloudPersonalTrip(
  _prev: TripActionResult,
  formData: FormData,
): Promise<TripActionResult> {
  const items = parseItems(String(formData.get("items") ?? "[]"));
  const result = await savePersonalTripItems(items);
  return { ok: result.ok, message: result.message };
}

export async function startGroupTrip(_prev: TripActionResult, formData: FormData): Promise<TripActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const result = await createGroupTrip(title);
  if (!result.ok) return result;
  return { ok: true, shareToken: result.shareToken };
}

export async function joinGroupTripAction(
  _prev: TripActionResult,
  formData: FormData,
): Promise<TripActionResult> {
  const token = String(formData.get("shareToken") ?? "").trim();
  if (token.length < 20) {
    return { ok: false, message: "This group link is not on file." };
  }
  return joinGroupTrip(token);
}