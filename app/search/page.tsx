import Link from "next/link";
import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import { EmptyNote } from "../components/states";
import { breadcrumbJsonLd } from "../jsonld";
import { kindLabel, searchDirectory } from "../search";
import { pageMetadata } from "../site";

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

function readQuery(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

export async function generateMetadata({ searchParams }: Props) {
  const q = readQuery((await searchParams).q);
  if (!q) {
    return pageMetadata({
      title: "Search",
      description:
        "Search confirmed events, organiser places, and season guide pages already on file at dirtydecember.info.",
      path: "/search",
    });
  }
  return pageMetadata({
    title: `Search: ${q}`,
    description: `Results on dirtydecember.info for “${q}” — confirmed events, places, and guide pages already on file.`,
    path: `/search?q=${encodeURIComponent(q)}`,
  });
}

function kindTone(kind: "event" | "place" | "guide") {
  if (kind === "event") return "text-oxide";
  if (kind === "place") return "text-lagoon";
  return "text-brass";
}

export default async function SearchPage({ searchParams }: Props) {
  const q = readQuery((await searchParams).q);
  const results = q ? searchDirectory(q, 40) : [];

  return (
    <main
      id="top"
      className="mx-auto w-full max-w-6xl px-5 pb-28 pt-28 md:px-8 md:pt-36 lg:pb-16"
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Search", path: "/search" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Search" },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">
        Directory search
      </p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">
        Search
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
        Matches confirmed events, organiser places, and guide pages already on
        file — never invented listings.
      </p>

      <form
        role="search"
        action="/search"
        method="get"
        className="mt-8 max-w-xl"
      >
        <label htmlFor="search-page-q" className="sr-only">
          Search query
        </label>
        <div className="flex gap-2">
          <input
            id="search-page-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Event, place, city, or guide"
            className="ledger-input flex-1"
          />
          <button
            type="submit"
            className="shrink-0 bg-oxide px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-chart"
          >
            Search
          </button>
        </div>
      </form>

      <section className="mt-10" aria-live="polite">
        {!q ? (
          <EmptyNote>Type a query to search the directory on file.</EmptyNote>
        ) : results.length === 0 ? (
          <EmptyNote>
            No confirmed event, place, or guide page matches “{q}”.
          </EmptyNote>
        ) : (
          <>
            <p className="text-sm text-muted">
              {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
            </p>
            <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {results.map((hit) => (
                <li key={hit.href}>
                  <Link
                    href={hit.href}
                    className="block py-4 hover:text-oxide"
                  >
                    <span
                      className={`text-[10px] uppercase tracking-[0.2em] ${kindTone(hit.kind)}`}
                    >
                      {kindLabel(hit.kind)}
                    </span>
                    <span className="mt-1 block font-display text-2xl leading-tight tracking-tight">
                      {hit.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted">
                      {hit.subtitle}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
