"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { disclaimer, footerExtra, nav } from "../brand";
import { rideHailMarkets } from "../ride-hailing";
import { HeaderSearch } from "./header-search";
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

const footerLink = "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

const footerKicker = "font-sans text-[11px] uppercase tracking-[0.28em] text-lagoon";

export function SiteChrome({
  children,
  clock,
}: {
  children: ReactNode;
  clock: ReactNode;
}) {
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
        <div className="flex h-[var(--clock-strip)] min-w-0 items-start border-b border-brass/40 bg-paper-deep pt-1 lg:pt-1.5">
          {clock}
        </div>
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-ink">
            <PlaneMark />
            <span className="font-display text-[1.05rem] leading-none tracking-tight">
              dirtydecember
              <span className="text-gold">.info</span>
            </span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 lg:justify-between lg:gap-4">
            <HeaderSearch />
            <nav aria-label="Pages" className="hidden items-center gap-3 lg:flex xl:gap-4">
              {nav.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={current(pathname, href) ? "page" : undefined}
                  className={`text-[11px] uppercase tracking-[0.14em] hover:text-oxide xl:tracking-[0.16em] ${
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
              className="hidden shrink-0 bg-oxide px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-chart xl:inline-flex"
            >
              Explore the guide
            </Link>
          </div>
        </div>
        <div className="hidden h-0.5 bg-oxide lg:block" />
        <div className="hidden lg:block">
          <NewsTicker />
        </div>
      </header>
      <div className="mobile-scroll lg:contents">
      <div aria-hidden="true" className="h-[var(--clock-strip)] min-w-0 shrink-0" />
      {children}
      <footer className="border-t border-ink/15 pb-32 lg:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12 md:px-8 lg:py-16">
          <div>
            <p className="font-display text-3xl text-ink">
              dirtydecember<span className="text-oxide">.info</span>
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">{disclaimer}</p>
            <p className="mt-4 font-sans text-sm leading-6 text-ink">
              <a href="https://www.oxbreedmanagement.com" className={footerLink}>
                Powered by Oxbreed Management
              </a>
              .
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
            <p className="min-w-0">
              <span className={`block ${footerKicker}`}>Visitor enquiries</span>
              <a
                href="mailto:hello@dirtydecember.info"
                className={`mt-2 inline-block max-w-full font-sans text-sm leading-6 text-ink ${footerLink}`}
              >
                hello@dirtydecember.info
              </a>
            </p>
            <p className="min-w-0">
              <span className={`block ${footerKicker}`}>Partner enquiries</span>
              <a
                href="mailto:partners@dirtydecember.info"
                className={`mt-2 inline-block max-w-full font-sans text-sm leading-6 text-ink ${footerLink}`}
              >
                partners@dirtydecember.info
              </a>
            </p>
          </div>
          <div>
            <p className={footerKicker}>Get around</p>
            <p className="mt-2 max-w-xl font-sans text-sm leading-6 text-muted">
              Third-party ride apps by country — outbound only, not a booking on
              this site. Full city notes on{" "}
              <Link href="/guide#around" className={footerLink}>
                Guide · Get around
              </Link>
              {" · "}
              <Link href="/flights#get-around" className={footerLink}>
                Flights
              </Link>
              .
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rideHailMarkets.map((market) => (
                <p key={market.country} className="min-w-0 font-sans text-sm leading-6">
                  <span className="block text-[11px] uppercase tracking-[0.22em] text-lagoon">
                    {market.country}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {market.apps.map((app) => (
                      <a
                        key={app.url}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-ink ${footerLink}`}
                      >
                        {app.name}
                      </a>
                    ))}
                  </span>
                </p>
              ))}
            </div>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 font-sans text-sm leading-6">
            {footerExtra.map(([label, href]) => (
              <Link key={href} href={href} className={`text-ink ${footerLink}`}>
                {label}
              </Link>
            ))}
            <Link href="/sign-in" className={`text-ink ${footerLink}`}>
              Sign in
            </Link>
            <Link href="/privacy" className={`text-ink ${footerLink}`}>
              Privacy
            </Link>
            <Link href="/terms" className={`text-ink ${footerLink}`}>
              Terms
            </Link>
            <Link href="/eula" className={`text-ink ${footerLink}`}>
              EULA
            </Link>
          </nav>
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
