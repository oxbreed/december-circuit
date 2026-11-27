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

/** Same-site names that should reuse an existing pin instead of a second marker. */
const PIN_ALIASES: Record<string, Record<string, string>> = {
  Accra: { "black star square": "independence square" },
  Lagos: { "the lagos continental": "lagos continental hotel" },
};

/** Match a listed place or venue name to a sourced pin in the same city. */
export function pinForName(city: string, name: string | null | undefined): Pin | null {
  if (!name) return null;
  let needle = normalizeName(name);
  if (!needle) return null;
  const alias = PIN_ALIASES[city]?.[needle];
  if (alias) needle = alias;
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
