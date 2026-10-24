import type { Pin } from "./pins";
import { pins } from "./pins";

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Match a listed place or venue name to a sourced pin in the same city. */
export function pinForName(city: string, name: string | null | undefined): Pin | null {
  if (!name) return null;
  const needle = normalizeName(name);
  if (!needle) return null;
  const inCity = pins.filter((pin) => pin.city === city);
  const exact = inCity.find((pin) => normalizeName(pin.name) === needle);
  if (exact) return exact;
  return (
    inCity.find((pin) => {
      const hay = normalizeName(pin.name);
      return hay.includes(needle) || needle.includes(hay);
    }) ?? null
  );
}

export function pinsInCity(city: string, country: string) {
  return pins.filter((pin) => pin.city === city && pin.country === country);
}
