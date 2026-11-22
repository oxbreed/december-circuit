"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navPrimary, navSecondary } from "../brand";
import { HeaderMenu } from "./header-menu";
import { HeaderSearch } from "./header-search";
import { HeaderTripLink } from "./header-trip-link";
import { DesktopNewsTicker } from "./desktop-news-ticker";
import { SiteFooter } from "./site-footer";

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

export function SiteChrome({ children, support }: { children: ReactNode; support: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur-md max-lg:pt-[env(safe-area-inset-top,0px)] max-lg:pl-[env(safe-area-inset-left,0px)] max-lg:pr-[env(safe-area-inset-right,0px)]">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2 text-ink">
            <PlaneMark />
            <span className="font-display text-[1.05rem] leading-none tracking-tight">
              dirtydecember
              <span className="text-gold">.info</span>
            </span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 lg:justify-between lg:gap-4">
            <HeaderSearch />
            <div className="flex shrink-0 items-center gap-3">
              <HeaderMenu />
              <nav aria-label="Pages" className="hidden min-w-0 items-center gap-2 lg:flex xl:gap-3">
                <div className="flex flex-wrap items-center gap-2 xl:gap-3">
                  <span className="sr-only">Directory and planning</span>
                  {navPrimary.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      aria-current={current(pathname, href) ? "page" : undefined}
                      className={`whitespace-nowrap text-[11px] uppercase tracking-[0.14em] hover:text-oxide xl:tracking-[0.16em] ${
                        current(pathname, href)
                          ? "text-oxide underline decoration-oxide decoration-2 underline-offset-8"
                          : "text-ink/85"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
                <span className="hidden h-3.5 w-px shrink-0 bg-ink/20 xl:block" aria-hidden="true" />
                <div className="hidden flex-wrap items-center gap-2 xl:flex xl:gap-3">
                  <span className="sr-only">Trip tools</span>
                  {navSecondary.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      aria-current={current(pathname, href) ? "page" : undefined}
                      className={`whitespace-nowrap text-[11px] uppercase tracking-[0.12em] hover:text-oxide ${
                        current(pathname, href)
                          ? "text-oxide underline decoration-oxide decoration-2 underline-offset-8"
                          : "text-ink/70"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
                <HeaderTripLink />
              </nav>
              <Link
                href="/guide"
                className="hidden shrink-0 bg-oxide px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-chart xl:inline-flex"
              >
                Explore the guide
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden h-0.5 bg-oxide lg:block" />
        <DesktopNewsTicker />
      </header>
      <div className="mobile-scroll lg:contents">
      {children}
      <SiteFooter />
      </div>
      <div className="mobile-dock">
        <nav aria-label="Mobile pages" className="contents lg:hidden">
          {navPrimary.filter(([, href]) => href !== "/visa").map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={current(pathname, href) ? "page" : undefined}
              className="mobile-dock-action"
            >
              {label}
            </Link>
          ))}
          <HeaderTripLink dock />
        </nav>
        {support}
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
