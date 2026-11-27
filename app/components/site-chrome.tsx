"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navPrimary } from "../brand";
import { HeaderMenu } from "./header-menu";
import { HeaderSearch } from "./header-search";
import { HeaderTripLink } from "./header-trip-link";
import { DesktopNewsTicker } from "./desktop-news-ticker";
import { PlaneMark } from "./plane-mark";
import { SiteFooter } from "./site-footer";

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
            <PlaneMark className="h-6 w-6 lg:h-8 lg:w-8" />
            <span className="font-display text-[1.05rem] leading-none tracking-tight">
              dirtydecember
              <span className="text-gold">.info</span>
            </span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 lg:justify-between lg:gap-4">
            <HeaderSearch />
            <div className="flex shrink-0 items-center gap-3">
              <HeaderMenu />
              <nav aria-label="Pages" className="hidden min-w-0 items-center gap-5 lg:flex">
                <span className="sr-only">Directory</span>
                {navPrimary.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={current(pathname, href) ? "page" : undefined}
                    className={`whitespace-nowrap text-[12px] tracking-wide hover:text-oxide ${
                      current(pathname, href)
                        ? "font-semibold text-oxide"
                        : "text-ink/85"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <HeaderTripLink />
              </nav>
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
