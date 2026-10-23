"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { disclaimer, nav } from "../brand";
import { NewsTicker } from "./news-ticker";

function PlaneMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-4 w-4">
      <rect width="32" height="32" rx="6" fill="#f4eadc" />
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="5"
        fill="none"
        stroke="#8a6232"
        strokeWidth="2"
      />
      <path
        fill="#1a1410"
        d="M16 3.5 19.2 11.2 29 15.2 29 18.2 19.2 16.2 18.2 23.5 23.5 26.5 23.5 28.5 16 26.2 8.5 28.5 8.5 26.5 13.8 23.5 12.8 16.2 3 18.2 3 15.2 12.8 11.2Z"
      />
      <path fill="#b8432f" d="M8.5 26.2 13.6 23.6 16 25.4 18.4 23.6 23.5 26.2 23.5 28.2 16 26 8.5 28.2Z" />
    </svg>
  );
}

function current(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = barRef.current;
    if (!node) return;
    const apply = () => {
      document.documentElement.style.setProperty("--mobile-bar", `${node.offsetHeight}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--mobile-bar");
    };
  }, []);

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
            <PlaneMark />
            <span className="font-display text-[1.05rem] leading-none tracking-tight">
              dirtydecember
              <span className="text-gold">.info</span>
            </span>
          </Link>
          <nav aria-label="Pages" className="hidden items-center gap-4 lg:flex">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={current(pathname, href) ? "page" : undefined}
                className={`text-[11px] uppercase tracking-[0.16em] hover:text-oxide ${
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
            href="/guide"
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
      <div className="mobile-scroll lg:contents">
      {children}
      <footer className="border-t border-ink/15 pb-32 lg:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
          <div>
            <p className="font-display text-3xl text-ink">
              dirtydecember<span className="text-oxide">.info</span>
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">{disclaimer}</p>
            <p className="mt-4 font-sans text-sm text-ink">
              <a
                href="https://www.oxbreedmanagement.com"
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                Powered by Oxbreed Management
              </a>
              .
            </p>
            <ul className="mt-3 space-y-1 font-sans text-sm leading-6 text-ink">
              <li>
                <a
                  href="mailto:hello@dirtydecember.info"
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  Visitor enquiries: hello@dirtydecember.info
                </a>
              </li>
              <li>
                <a
                  href="mailto:partners@dirtydecember.info"
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  Partner enquiries: partners@dirtydecember.info
                </a>
              </li>
              <li>
                <Link
                  href="/list"
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  List an event
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
      </div>
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-0 z-40 max-w-full overflow-x-clip border-t border-ink/10 bg-paper/95 backdrop-blur-md lg:hidden"
      >
        <NewsTicker />
        <nav aria-label="Mobile pages" className="grid grid-cols-7 px-1 py-2">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={current(pathname, href) ? "page" : undefined}
              className={`flex min-w-0 items-center justify-center whitespace-nowrap px-0.5 py-1 text-center text-[12px] font-medium uppercase leading-none tracking-tight ${
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
