"use client";

import { useSyncExternalStore } from "react";
import type { TripKind } from "../trip";

const KEY = "dirtydecember-trip";
const CHANGE = "dirtydecember-trip-change";
const EMPTY = "[]";

export type TripItem = {
  kind: TripKind;
  id: string;
};

function isTripItem(value: unknown): value is TripItem {
  if (!value || typeof value !== "object") return false;
  const item = value as { kind?: unknown; id?: unknown };
  return (
    (item.kind === "event" || item.kind === "place") &&
    typeof item.id === "string" &&
    item.id.length > 0
  );
}

function readItems(): TripItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTripItem);
  } catch {
    return [];
  }
}

function snapshot() {
  return JSON.stringify(readItems());
}

function write(items: TripItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE));
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener();
  };
  window.addEventListener(CHANGE, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTripItems() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed.filter(isTripItem) : [];
}

export function toggleTrip(item: TripItem) {
  const items = readItems();
  const index = items.findIndex((row) => row.kind === item.kind && row.id === item.id);
  if (index === -1) items.push(item);
  else items.splice(index, 1);
  write(items);
}

export function removeTrip(item: TripItem) {
  write(readItems().filter((row) => !(row.kind === item.kind && row.id === item.id)));
}
