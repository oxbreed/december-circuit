"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { disclaimer, navPrimary, navSecondary } from "../brand";
import { HeaderSearch } from "./header-search";
import { HeaderTripLink } from "./header-trip-link";
import { DesktopNewsTicker } from "./desktop-news-ticker";

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

const footerGroups = [
  {
    title: "Visit",
    links: [
      ["Events", "/events"],
      ["Places", "/places"],
      ["Cities", "/cities"],
      ["Detty December", "/detty-december"],
      ["West Africa", "/west-africa"],
      ["News", "/news"],
    ],
  },
  {
    title: "Plan",
    links: [
      ["Season guides", "/guides"],
      ["Travel guide", "/guide"],
      ["Flights", "/flights"],
      ["Map", "/map"],
      ["Visa", "/visa"],
      ["FAQ", "/faq"],
      ["Get around", "/guide#around"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Explore", "/explore"],
      ["List an event or place", "/list"],
      ["Get featured", "/get-featured"],
      ["Give feedback", "/feedback"],
      ["Sign in", "/sign-in"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["EULA", "/eula"],
      ["Cookies", "/cookies"],
      ["Disclosure", "/disclosure"],
    ],
  },
] as const;

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
      <footer className="site-footer scroll-mt-36 border-t border-ink/15">
        <div className="site-footer-inner mx-auto flex max-w-6xl flex-col gap-10 px-5 md:px-8">
          <div>
            <p className="font-display text-3xl text-ink">
              dirtydecember<span className="text-oxide">.info</span>
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">{disclaimer}</p>
            <div className="mt-6 grid max-w-xl grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
              <p className="min-w-0">
                <span className={`block ${footerKicker}`}>Visitor enquiries</span>
                <a
                  href="mailto:hello@dirtydecember.info"
                  className={`inline-flex min-h-11 max-w-full items-center font-sans text-sm text-ink ${footerLink}`}
                >
                  hello@dirtydecember.info
                </a>
              </p>
              <p className="min-w-0">
                <span className={`block ${footerKicker}`}>Partner enquiries</span>
                <a
                  href="mailto:partners@dirtydecember.info"
                  className={`inline-flex min-h-11 max-w-full items-center font-sans text-sm text-ink ${footerLink}`}
                >
                  partners@dirtydecember.info
                </a>
              </p>
            </div>
          </div>
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-10"
          >
            {footerGroups.map((group) => (
              <div key={group.title} className="min-w-0">
                <p className={footerKicker}>{group.title}</p>
                <ul className="mt-2 font-sans text-sm">
                  {group.links.map(([label, href]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`inline-flex min-h-11 items-center text-ink ${footerLink}`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <p className="border-t border-ink/15 pt-6 font-sans text-sm leading-6 text-muted lg:pr-36">
            © 2026 dirtydecember.info, powered by{" "}
            <a
              href="https://oxbreedstudio.com"
              className={`inline-flex min-h-11 items-center text-ink ${footerLink}`}
            >
              Oxbreed Management
            </a>
          </p>
        </div>
      </footer>
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
