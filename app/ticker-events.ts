import { events } from "./events";

export type TickerItem = {
  kind: "event" | "news";
  headline: string;
  source: string;
  link: string;
  published?: string;
  description?: string;
  image?: string;
};

export function eventTickerItems(): TickerItem[] {
  return events.map((event) => ({
    kind: "event",
    headline: `${event.when}. ${event.summary}`,
    source: "Confirmed event",
    link: event.url ?? "/events",
    published: event.when,
  }));
}
