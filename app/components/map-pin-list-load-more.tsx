"use client";

import type { Pin } from "../pins";
import { LoadMoreList } from "./load-more";

export function MapPinListLoadMore({ pins }: { pins: Pin[] }) {
  return (
    <LoadMoreList items={pins} mobileSize={6} desktopSize={12} noun="pins">
      {(visible) => (
        <ul className="columns-1 gap-x-8 text-sm leading-6 text-ink sm:columns-2 lg:columns-3">
          {visible.map((pin) => (
            <li
              key={`${pin.city}-${pin.name}-${pin.latitude}-${pin.longitude}`}
              className="break-inside-avoid py-0.5"
            >
              <span className="text-ink">{pin.name}</span>
              <span className="text-muted">
                {" "}
                — {pin.city}, {pin.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </LoadMoreList>
  );
}
