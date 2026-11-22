"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navPrimary, navSecondary } from "../brand";
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
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !menu?.contains(event.target)) menu?.removeAttribute("open");
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

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
              <details
                ref={menuRef}
                className="lg:hidden"
                onKeyDown={(event) => {
                  if (event.key !== "Escape" || !event.currentTarget.open) return;
                  event.stopPropagation();
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary")?.focus();
                }}
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center border border-ink/20 px-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  Menu
                </summary>
                <nav aria-label="More pages" className="absolute inset-x-3 top-full grid max-h-[min(26rem,65dvh)] grid-cols-2 gap-1 overflow-y-auto border border-ink/15 bg-chart p-2 shadow-lg">
                  {[...navSecondary, ["Visa and entry", "/visa"], ["Give feedback", "/feedback"]].map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      aria-current={current(pathname, href) ? "page" : undefined}
                      onClick={() => menuRef.current?.removeAttribute("open")}
                      className="flex min-h-11 items-center px-3 text-sm hover:bg-paper focus-visible:bg-paper aria-[current=page]:font-semibold aria-[current=page]:text-oxide"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </details>
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
