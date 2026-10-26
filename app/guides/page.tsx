import Link from "next/link";
import { disclaimer } from "../brand";
import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import { SeasonGuideNav } from "../components/season-guide-chrome";
import { breadcrumbJsonLd } from "../jsonld";
import {
  guidesHubPath,
  seasonGuideIndex,
  SEASON_YEAR,
  visaCheck,
} from "../season-guides";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: `Season guides ${SEASON_YEAR}`,
  description: `Detty December ${SEASON_YEAR} season guides on dirtydecember.info: Flytime Fest lineup tracker, Carnival Calabar programme, Lagos December, Accra and Ghana from the GTA programme, and US / UK / Canada visa pages with check dates. Sourced records only.`,
  path: guidesHubPath,
});

export default function GuidesHubPage() {
  const visas = visaCheck();

  return (
    <main
      id="top"
      className="mx-auto w-full max-w-6xl px-5 pb-28 pt-28 md:px-8 md:pt-36 lg:pb-16"
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: guidesHubPath },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Guides" },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-lagoon">
        December {SEASON_YEAR}
      </p>
      <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-7xl">
        Season <span className="italic text-oxide">guides</span>
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
        Permanent year URLs for diaspora planning — Flytime lineup, Carnival Calabar,
        Lagos, Accra and Ghana, plus visa pages with check dates. Every fact comes from a
        record or official page already on file. {disclaimer}
      </p>
      <SeasonGuideNav currentPath={guidesHubPath} />

      <section className="mt-12">
        <h2 className="font-display text-3xl tracking-tight">{SEASON_YEAR} guides</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {seasonGuideIndex.map((guide) => (
            <li key={guide.path}>
              <Link
                href={guide.path}
                className="block border border-ink/15 bg-chart px-5 py-6 hover:border-oxide/40"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-lagoon">
                  {guide.path}
                </p>
                <p className="mt-2 font-display text-2xl leading-tight tracking-tight">
                  {guide.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">{guide.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl tracking-tight">Visa by passport</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Extends the visa guide (DD-13). Requirements repeat official Nigeria and Ghana
          immigration pages only. Check date: {visas.checkedAtLabel}.
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <li>
            <Link
              href="/visa"
              className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
            >
              Visa and entry hub
            </Link>
          </li>
          {visas.nationalityPages.map((page) => (
            <li key={page.slug}>
              <Link
                href={page.path}
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {page.travellerLabel} travellers
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-display text-3xl tracking-tight">Year-roll</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          These {SEASON_YEAR} URLs stay live. When {SEASON_YEAR + 1} opens, add matching{" "}
          <code className="text-ink">…-{SEASON_YEAR + 1}</code> paths so authority compounds —
          do not replace or redirect away the {SEASON_YEAR} pages. Full playbook: season guide
          docs in the project store.
        </p>
      </section>
    </main>
  );
}
