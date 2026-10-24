import type { CircuitEvent } from "./events";
import { presentEvent } from "./event-view";
import { landmarks, type FramePhoto } from "./landmarks";
import { defaultShareImage } from "./site";

export type ShareImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

function fromLandmark(shot: FramePhoto): ShareImage {
  return {
    url: shot.src,
    alt: `${shot.name}, ${shot.city} — dirtydecember.info`,
    width: 960,
    height: 540,
  };
}

export function shareImageForCity(city: string): ShareImage {
  const shot = landmarks.find((item) => item.city === city);
  return shot ? fromLandmark(shot) : { ...defaultShareImage };
}

export function shareImageForEvent(event: CircuitEvent): ShareImage {
  const view = presentEvent(event);
  const byName = landmarks.find(
    (item) =>
      item.name.toLowerCase().includes(view.name.toLowerCase().slice(0, 18)) ||
      view.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 18)),
  );
  if (byName) return fromLandmark(byName);
  if (view.venue) {
    const byVenue = landmarks.find(
      (item) =>
        item.name.toLowerCase().includes(view.venue!.toLowerCase()) ||
        view.venue!.toLowerCase().includes(item.name.toLowerCase()),
    );
    if (byVenue) return fromLandmark(byVenue);
  }
  return shareImageForCity(event.region);
}
