import type { Place } from "./places";

export type UgcSubjectKind = "event" | "place" | "site";

export type EventOrPlaceSubject = {
  kind: "event" | "place";
  key: string;
};

export type UgcSubject =
  | EventOrPlaceSubject
  | {
      kind: "site";
      key: string;
    };

function slugPart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Stable key for a directory place. Used only for UGC rows, not ratings in places.ts. */
export function placeSubjectKey(place: Pick<Place, "country" | "city" | "name">) {
  return `${slugPart(place.country)}--${slugPart(place.city)}--${slugPart(place.name)}`;
}

export function eventSubject(slug: string): EventOrPlaceSubject {
  return { kind: "event", key: slug };
}

export function placeSubject(place: Pick<Place, "country" | "city" | "name">): EventOrPlaceSubject {
  return { kind: "place", key: placeSubjectKey(place) };
}

export function siteSubject(): Extract<UgcSubject, { kind: "site" }> {
  return { kind: "site", key: "home" };
}

export function isUgcSubjectKind(value: string): value is Exclude<UgcSubjectKind, "site"> {
  return value === "event" || value === "place";
}
