import Link from "next/link";
import { homeCard } from "./home-section";

type UpcomingRow = { href: string; name: string; region: string; when: string };

export function UpcomingHomeList({ rows }: { rows: UpcomingRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="max-w-2xl text-sm leading-7 text-muted">
        Nothing on the sourced list falls on or after today in Africa/Lagos.{" "}
        <a href="/list" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">List an event</a> for review.
      </p>
    );
  }
  return (
    <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
      {rows.map((event) => (
        <li key={`${event.href}-${event.when}`} className={`flex min-w-0 flex-col gap-2 p-4 ${homeCard}`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-oxide">{event.when}</p>
          <Link prefetch={false} href={event.href} className="font-display text-xl leading-tight tracking-tight hover:text-oxide">
            {event.name}
          </Link>
          <p className="mt-auto text-xs uppercase tracking-[0.16em] text-muted">{event.region}</p>
        </li>
      ))}
    </ul>
  );
}
