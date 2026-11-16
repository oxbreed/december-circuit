import type { Pin } from "./pins";
import { pinId } from "./components/pin-id";

export type CircuitMapPin = Pin & {
  pinColor?: string;
  markerId?: string;
};

export function circuitPinId(pin: CircuitMapPin) {
  return pin.markerId ?? pinId(pin);
}