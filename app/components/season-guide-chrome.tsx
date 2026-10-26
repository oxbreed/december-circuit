import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { guidesHubPath, seasonGuideIndex, SEASON_YEAR } from "../season-guides";

const linkClass =
  "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

export function SeasonGuideNav({ currentPath }: { currentPath?: string }) {
  return (
    <nav
      aria-label="Season guides"
      className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-6"
    >
      <Link href={guidesHubPath} className={linkClass}>
        {SEASON_YEAR} guides hub
      </Link>
      {seasonGuideIndex.map((guide) => (
        <Link
          key={guide.path}
          href={guide.path}
          aria-current={currentPath === guide.path ? "page" : undefined}
          className={linkClass}
        >
          {guide.title.replace(` ${SEASON_YEAR}`, "").replace(" 2026", "")}
        </Link>
      ))}
      <Link href="/visa" className={linkClass}>
        Visa
      </Link>
      <Link href="/detty-december" className={linkClass}>
        Detty December
      </Link>
    </nav>
  );
}

export function SeasonGuideShell({
  breadcrumbs,
  kicker,
  title,
  lede,
  currentPath,
  children,
}: {
  breadcrumbs: { name: string; href?: string }[];
  kicker: string;
  title: ReactNode;
  lede: ReactNode;
  currentPath?: string;
  children: ReactNode;
}) {
  return (
    <main
      id="top"
      className="mx-auto w-full max-w-6xl px-5 pb-28 pt-28 md:px-8 md:pt-36 lg:pb-16"
    >
      <Breadcrumbs items={breadcrumbs} />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">{kicker}</p>
      <h1 className="mt-3 max-w-4xl font-display text-5xl leading-none tracking-tight md:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{lede}</p>
      <SeasonGuideNav currentPath={currentPath} />
      {children}
    </main>
  );
}

export function OutboundLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
    >
      {children}
    </a>
  );
}
