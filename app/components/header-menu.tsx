"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

type Item = { n?: string; label: string; href: string; hint?: string };

const explore: Item[] = [
  { n: "01", label: "Events", href: "/events", hint: "Concerts and festivals" },
  { n: "02", label: "Places", href: "/places", hint: "Stay, eat, go out" },
  { n: "03", label: "Map", href: "/map", hint: "The season on a map" },
];

const plan: Item[] = [
  { n: "04", label: "Guides", href: "/guides", hint: "Season city guides" },
  { n: "05", label: "Travel guide", href: "/guide", hint: "Visa, arrival, getting around" },
  { n: "06", label: "My trip", href: "/#trip", hint: "Saved events and places" },
  { n: "07", label: "Visa", href: "/visa", hint: "Entry notes" },
  { n: "08", label: "Flights", href: "/flights", hint: "Outbound search" },
];

const more: Item[] = [
  { label: "About", href: "/about" },
  { label: "Give feedback", href: "/feedback" },
];

function current(pathname: string, href: string) {
  if (href === "/#trip") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => searchRef.current?.focus(), 50);
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      searchRef.current?.focus();
      return;
    }
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function onToggleKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    }
  }

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        className="relative inline-flex h-11 w-11 items-center justify-center border border-ink/20 bg-chart text-ink hover:border-oxide hover:text-oxide"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={onToggleKey}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden="true" className="relative block h-3.5 w-4">
          <span
            className={`absolute left-0 block h-px w-4 bg-current transition-transform duration-[250ms] ease-out motion-reduce:transition-none ${
              open ? "top-[0.4rem] rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-[0.4rem] block h-px w-4 bg-current transition-opacity duration-[250ms] ease-out motion-reduce:transition-none ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 block h-px w-4 bg-current transition-transform duration-[250ms] ease-out motion-reduce:transition-none ${
              open ? "top-[0.4rem] -rotate-45" : "top-[0.8rem]"
            }`}
          />
        </span>
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="presentation"
        >
          <div
            className="absolute inset-0 bg-ink/45 motion-safe:animate-[menu-fade_250ms_ease-out] motion-reduce:animate-none"
            onClick={close}
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${panelId}-title`}
            className="absolute inset-y-0 right-0 flex w-[min(22rem,calc(100vw-2.75rem))] flex-col border-l border-ink bg-paper shadow-[-8px_0_40px_rgba(26,20,16,0.18)] motion-safe:animate-[menu-slide_250ms_ease-out] motion-reduce:animate-none"
          >
            <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
              <p id={`${panelId}-title`} className="font-display text-xl tracking-tight text-ink">
                Menu
              </p>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center border border-ink/20 text-ink hover:border-oxide hover:text-oxide"
                aria-label="Close menu"
                onClick={close}
              >
                <span aria-hidden="true" className="relative block h-3.5 w-4">
                  <span className="absolute left-0 top-[0.4rem] block h-px w-4 rotate-45 bg-current" />
                  <span className="absolute left-0 top-[0.4rem] block h-px w-4 -rotate-45 bg-current" />
                </span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <form role="search" onSubmit={onSearch} className="border border-ink/15 bg-chart px-3 py-2">
                <label htmlFor={`${panelId}-search`} className="sr-only">
                  Search events, places, and guides
                </label>
                <input
                  ref={searchRef}
                  id={`${panelId}-search`}
                  type="search"
                  name="q"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search events, places, guides"
                  className="h-11 w-full bg-transparent font-sans text-base text-ink placeholder:text-muted focus:outline-none"
                />
              </form>

              <MenuGroup title="Explore" items={explore} pathname={pathname} onNavigate={close} />
              <MenuGroup title="Plan" items={plan} pathname={pathname} onNavigate={close} />

              <div className="mt-8 border-t border-ink pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass">More</p>
                <ul className="mt-3 flex flex-col">
                  {more.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={current(pathname, item.href) ? "page" : undefined}
                        onClick={close}
                        className={`flex min-h-11 items-center text-sm tracking-wide hover:text-oxide ${
                          current(pathname, item.href) ? "font-semibold text-oxide" : "text-ink"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-ink/15 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              <a href="mailto:hello@dirtydecember.info" className="inline-flex min-h-11 items-center hover:text-oxide">
                hello@dirtydecember.info
              </a>
              <Link href="/list" onClick={close} className="inline-flex min-h-11 items-center hover:text-oxide">
                List a place
              </Link>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

function MenuGroup({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: Item[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="mt-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-oxide">{title}</p>
      <ul className="mt-3">
        {items.map((item) => {
          const active = current(pathname, item.href);
          return (
            <li key={item.href} className="border-t border-ink/10 last:border-b">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={`flex min-h-[3.25rem] items-baseline gap-3 py-2.5 hover:text-oxide ${
                  active ? "text-oxide" : "text-ink"
                }`}
              >
                {item.n ? (
                  <span className="w-6 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-brass">
                    {item.n}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[1.65rem] leading-none tracking-tight">{item.label}</span>
                  {item.hint ? <span className="mt-1 block text-xs text-muted">{item.hint}</span> : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
