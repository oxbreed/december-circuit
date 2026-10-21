import type { Pin } from "../pins";

export function pinId(pin: Pick<Pin, "country" | "city" | "name">) {
  return `${pin.country}|${pin.city}|${pin.name}`;
}

export function directionsHref(pin: Pick<Pin, "latitude" | "longitude">) {
  return `https://www.openstreetmap.org/directions?to=${pin.latitude}%2C${pin.longitude}`;
}
