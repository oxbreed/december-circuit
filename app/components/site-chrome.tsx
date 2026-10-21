"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { disclaimer, nav } from "../brand";
import { NewsTicker } from "./news-ticker";

function PalmMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 text-lagoon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M12 21V10" />
      <path d="M12 11c-2-4-6-5-8-4 2 2 4 3 8 4Z" />
      <path d="M12 10c2-4 6-6 8-5-2 2-4 4-8 5Z" />
      <path d="M12 12c-3-2-5-1-7 1 2 1 4 1 7-1Z" />
      <path d="M12 12c3-2 6-1 8 1-3 1-5 1-8-1Z" />
    </svg>
  );
}

function current(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-paper/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-ink">
            <PalmMark />
            <span className="font-display text-[1.05rem] leading-none tracking-tight">
              dirtydecember
              <span className="text-gold">.info</span>
            </span>
          </Link>
          <nav aria-label="Pages" className="hidden items-center gap-6 lg:flex">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={current(pathname, href) ? "page" : undefined}
                className={`text-[11px] uppercase tracking-[0.22em] hover:text-oxide ${
                  current(pathname, href)
                    ? "text-oxide underline decoration-oxide decoration-2 underline-offset-8"
                    : "text-ink/75"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/events"
            className="hidden bg-oxide px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-chart lg:inline-flex"
          >
            Explore the guide
          </Link>
        </div>
        <div className="hidden h-0.5 bg-oxide lg:block" />
        <div className="hidden lg:block">
          <NewsTicker />
        </div>
      </header>
      {children}
      <footer className="border-t border-ink/15 pb-32 lg:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <p className="font-display text-3xl text-ink">
              dirtydecember<span className="text-oxide">.info</span>
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">{disclaimer}</p>
          </div>
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-muted">
            Checked 21 October 2026
          </p>
        </div>
      </footer>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 backdrop-blur-md lg:hidden">
        <NewsTicker />
        <nav aria-label="Mobile pages" className="grid grid-cols-6 px-1 py-2">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={current(pathname, href) ? "page" : undefined}
              className={`px-1 py-1 text-center text-[9px] uppercase tracking-[0.08em] ${
                current(pathname, href) ? "text-oxide" : "text-ink/70"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <noscript>
        <p className="mx-auto max-w-6xl px-5 pb-10 text-sm leading-6 text-muted md:px-8">
          This directory loads events, places, flight searches, and the map from
          this site. JavaScript is required to read those lists.
        </p>
      </noscript>
    </>
  );
}
