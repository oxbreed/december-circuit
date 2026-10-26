"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

type SearchKind = "event" | "place" | "guide";

type SearchHit = {
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
};

type SearchResponse = {
  q: string;
  results: SearchHit[];
  empty: boolean;
  message?: string;
};

function kindLabel(kind: SearchKind) {
  if (kind === "event") return "Event";
  if (kind === "place") return "Place";
  return "Guide";
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="10.5" cy="10.5" r="6.25" />
      <path d="M15.5 15.5 20 20" strokeLinecap="round" />
    </svg>
  );
}

function kindTone(kind: SearchKind) {
  if (kind === "event") return "text-oxide";
  if (kind === "place") return "text-lagoon";
  return "text-gold";
}

export function HeaderSearch() {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [openMobile, setOpenMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [payload, setPayload] = useState<SearchResponse | null>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setOpenMobile(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setPayload(null);
      setLoading(false);
      setError(false);
      setActive(-1);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(false);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=8`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(String(response.status));
          return (await response.json()) as SearchResponse;
        })
        .then((data) => {
          if (controller.signal.aborted) return;
          setPayload(data);
          setLoading(false);
          setOpen(true);
          setActive(-1);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setPayload(null);
          setLoading(false);
          setError(true);
          setOpen(true);
        });
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!openMobile) return;
    inputRef.current?.focus();
  }, [openMobile]);

  function goSearchPage(value = query) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setOpen(false);
    setOpenMobile(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (active >= 0 && payload?.results[active]) {
      const hit = payload.results[active];
      setOpen(false);
      setOpenMobile(false);
      router.push(hit.href);
      return;
    }
    goSearchPage();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const results = payload?.results ?? [];
    if (event.key === "Escape") {
      setOpen(false);
      setOpenMobile(false);
      return;
    }
    if (!open || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (value + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => (value <= 0 ? results.length - 1 : value - 1));
    }
  }

  const showPanel =
    (open || openMobile) && (loading || error || payload !== null);
  const results = payload?.results ?? [];

  return (
    <div ref={rootRef} className="relative min-w-0">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          aria-expanded={openMobile}
          aria-controls="header-search-field"
          aria-label={openMobile ? "Close search" : "Open search"}
          onClick={() => setOpenMobile((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center border border-ink/15 text-ink hover:border-oxide hover:text-oxide md:hidden"
        >
          <SearchIcon className="h-4 w-4" />
        </button>

        <form
          id="header-search-field"
          role="search"
          onSubmit={onSubmit}
          className={`relative min-w-0 ${
            openMobile ? "absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)]" : "hidden"
          } md:static md:mt-0 md:block md:w-[13rem] lg:w-[12.5rem] xl:w-[15rem]`}
        >
          <label htmlFor="header-global-search" className="sr-only">
            Search events, places, and guides
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/45" />
            <input
              ref={inputRef}
              id="header-global-search"
              type="search"
              name="q"
              value={query}
              autoComplete="off"
              spellCheck={false}
              placeholder="Search events, places, guides"
              aria-autocomplete="list"
              aria-controls={listId}
              aria-expanded={showPanel}
              aria-activedescendant={
                active >= 0 ? `${listId}-option-${active}` : undefined
              }
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                if (query.trim()) setOpen(true);
              }}
              onKeyDown={onKeyDown}
              className="w-full border border-ink/15 bg-paper-deep py-1.5 pl-8 pr-3 font-sans text-sm leading-5 text-ink placeholder:text-ink/40 focus:border-oxide focus:outline-none"
            />
          </div>

          {showPanel ? (
            <div
              id={listId}
              role="listbox"
              aria-label="Search results"
              className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-[min(70vh,22rem)] overflow-y-auto border border-ink/15 bg-paper shadow-[0_12px_40px_rgba(26,20,16,0.12)]"
            >
              {loading ? (
                <p className="px-3 py-3 font-sans text-sm text-muted" role="status">
                  Searching…
                </p>
              ) : null}
              {!loading && error ? (
                <p className="px-3 py-3 font-sans text-sm text-oxide" role="alert">
                  Search could not load. Try again.
                </p>
              ) : null}
              {!loading && !error && payload?.empty ? (
                <p className="px-3 py-3 font-sans text-sm text-muted">
                  {payload.message ?? "No matches on file."}
                </p>
              ) : null}
              {!loading && !error && results.length > 0 ? (
                <ul className="py-1">
                  {results.map((hit, index) => (
                    <li
                      key={hit.href}
                      role="option"
                      id={`${listId}-option-${index}`}
                    >
                      <Link
                        href={hit.href}
                        onClick={() => {
                          setOpen(false);
                          setOpenMobile(false);
                        }}
                        className={`block px-3 py-2.5 hover:bg-paper-deep ${
                          index === active ? "bg-paper-deep" : ""
                        }`}
                      >
                        <span
                          className={`text-[10px] uppercase tracking-[0.2em] ${kindTone(hit.kind)}`}
                        >
                          {kindLabel(hit.kind)}
                        </span>
                        <span className="mt-0.5 block font-sans text-sm leading-5 text-ink">
                          {hit.title}
                        </span>
                        <span className="mt-0.5 block truncate font-sans text-xs leading-4 text-muted">
                          {hit.subtitle}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li className="border-t border-ink/10">
                    <button
                      type="button"
                      onClick={() => goSearchPage()}
                      className="w-full px-3 py-2.5 text-left font-sans text-xs uppercase tracking-[0.16em] text-ink/70 hover:bg-paper-deep hover:text-oxide"
                    >
                      View all results
                    </button>
                  </li>
                </ul>
              ) : null}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
