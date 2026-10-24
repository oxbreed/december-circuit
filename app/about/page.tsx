import { disclaimer } from "../brand";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "About",
  description:
    "What this independent directory lists, and when a record is allowed on the site.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">About</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        An independent directory
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        <p>
          A listing appears only when an organiser page or a named report
          confirms it.
        </p>
        <p>
          Confirmed events for December 2026. Dates come from the organiser or a
          named news report. Cities outside Lagos stay on the list.
        </p>
        <p>
          A place name opens that organiser page. A flight row opens a search,
          not a fare or a seat. The map uses the coordinates already on file,
          and directions leave this site.
        </p>
      </div>
    </main>
  );
}
