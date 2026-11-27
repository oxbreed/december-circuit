"use client";

import { Suspense, useEffect, useId, useRef } from "react";
import Link from "next/link";
import { openCookieSettings } from "../analytics-consent";
import { disclaimer } from "../brand";
import { NewsletterFooter } from "./newsletter-footer";
import { PlaneMark } from "./plane-mark";

const footerLink = "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

const footerKicker = "font-sans text-[11px] uppercase tracking-[0.28em] text-lagoon";

const footerGroups = [
  {
    number: "01",
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
    number: "02",
    title: "Plan",
    links: [
      ["Season guides", "/guides"],
      ["2026 calendar", "/detty-december/calendar"],
      ["Things to do in Lagos", "/guides/things-to-do-in-lagos-in-december-2026"],
      ["Accra December guide", "/guides/accra-ghana-2026"],
      ["Ticket safety", "/guides/detty-december-ticket-safety-2026"],
      ["Travel guide", "/guide"],
      ["Get around", "/guide#around"],
      ["Flights", "/flights"],
      ["Map", "/map"],
      ["Visa", "/visa"],
      ["FAQ", "/faq"],
    ],
  },
  {
    number: "03",
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
    number: "04",
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

const mdQuery = "(min-width: 768px)";

export function SiteFooter({ newsletterLive }: { newsletterLive: boolean }) {
  const baseId = useId();
  const detailsRefs = useRef<Array<HTMLDetailsElement | null>>([]);

  useEffect(() => {
    const media = window.matchMedia(mdQuery);

    function syncToViewport() {
      const desktop = media.matches;
      for (const el of detailsRefs.current) {
        if (!el) continue;
        if (desktop) el.open = true;
        else el.open = false;
      }
    }

    syncToViewport();

    function onChange() {
      if (media.matches) {
        for (const el of detailsRefs.current) {
          if (el) el.open = true;
        }
      }
    }

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);


  function onToggle(event: { currentTarget: HTMLDetailsElement }) {
    if (typeof window === "undefined" || window.matchMedia(mdQuery).matches) return;
    const el = event.currentTarget;
    if (!el.open) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  return (
    <footer className="site-footer scroll-mt-36 border-t border-ink bg-paper-deep">
      <div className="site-footer-inner mx-auto flex max-w-6xl flex-col gap-8 px-5 md:gap-10 md:px-8">
        <div>
          <p className="flex items-center gap-3 font-display text-3xl text-ink">
            <PlaneMark className="h-8 w-8 shrink-0" />
            <span>
              dirtydecember<span className="text-gold">.info</span>
            </span>
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
          <Suspense fallback={null}>
            <NewsletterFooter live={newsletterLive} />
          </Suspense>
        </div>
        <nav aria-label="Footer" className="site-footer-nav">
          {footerGroups.map((group, index) => {
            const panelId = `${baseId}-panel-${group.number}`;
            const headingId = `${baseId}-heading-${group.number}`;
            return (
              <details
                key={group.title}
                ref={(el) => {
                  detailsRefs.current[index] = el;
                }}
                className="site-footer-group min-w-0"
                open
                onToggle={onToggle}
              >
                <summary
                  className="site-footer-summary"
                  aria-controls={panelId}
                  aria-labelledby={headingId}
                >
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-oxide">
                      {group.number} —
                    </span>
                    <span
                      id={headingId}
                      className="font-display text-xl leading-none tracking-tight text-ink md:text-2xl"
                    >
                      {group.title}
                    </span>
                  </span>
                  <span className="footer-acc-icon" aria-hidden="true">
                    <span className="footer-acc-icon-bar footer-acc-icon-h" />
                    <span className="footer-acc-icon-bar footer-acc-icon-v" />
                  </span>
                </summary>
                <ul id={panelId} className="site-footer-links font-sans text-sm">
                  {group.links.map(([label, href]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`flex min-h-11 w-full items-center text-ink ${footerLink}`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                  {group.title === "Legal" ? (
                    <li>
                      <button
                        type="button"
                        onClick={openCookieSettings}
                        className={`flex min-h-11 w-full items-center text-left text-ink ${footerLink}`}
                      >
                        Cookie settings
                      </button>
                    </li>
                  ) : null}
                </ul>
              </details>
            );
          })}
        </nav>
        <p className="border-t border-ink/20 pt-6 font-sans text-sm leading-6 text-muted md:pr-36">
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
  );
}
