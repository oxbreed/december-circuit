import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { disclaimer } from "../../brand";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { JsonLd } from "../../components/json-ld";
import { VisaSections } from "../../components/visa-sections";
import { breadcrumbJsonLd } from "../../jsonld";
import { visaCheck, visaNationality } from "../../season-guides";
import { pageMetadata } from "../../site";

export function generateStaticParams() {
  return visaCheck().nationalityPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = visaNationality(slug);
  if (!page) return { title: "Visa" };
  const check = visaCheck();
  return pageMetadata({
    title: `Visa for ${page.travellerLabel} travellers — Nigeria & Ghana`,
    description: `Visa and entry notes for ${page.travellerLabel} travellers planning Detty December in Nigeria or Ghana. Repeats Nigeria Immigration Service and Ghana Immigration Service pages only. Check date ${check.checkedAtLabel}. No application or payment on this site.`,
    path: page.path,
  });
}

export default async function VisaNationalityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = visaNationality(slug);
  if (!page) notFound();
  const check = visaCheck();

  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Visa", path: "/visa" },
          { name: page.travellerLabel, path: page.path },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Visa", href: "/visa" },
          { name: page.travellerLabel },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-brass">
        Official pages · check date {check.checkedAtLabel}
      </p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        Visa for {page.travellerLabel} travellers
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">
        For diaspora visitors planning Detty December or a West Africa trip on a{" "}
        {page.travellerLabel} passport. Extends the shared visa guide (DD-13) — requirements
        still come only from the linked immigration sites. {disclaimer}
      </p>
      <VisaSections
        headingLevel="h1"
        showNationalityLinks={false}
        passportNote={page.passportNote}
      />
      <p className="mt-10 text-sm leading-7 text-muted">
        <Link href="/visa" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          All visa pages
        </Link>
        {" · "}
        {check.nationalityPages
          .filter((item) => item.slug !== page.slug)
          .map((item, index) => (
            <span key={item.slug}>
              {index > 0 ? " · " : null}
              <Link
                href={item.path}
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {item.travellerLabel}
              </Link>
            </span>
          ))}
        {" · "}
        <Link href="/guide" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Full tourist guide
        </Link>
        {" · "}
        <Link
          href="/guides"
          className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
        >
          Season guides
        </Link>
      </p>
    </main>
  );
}
