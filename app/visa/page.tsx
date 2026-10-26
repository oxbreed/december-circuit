import Link from "next/link";
import { disclaimer } from "../brand";
import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import { VisaSections } from "../components/visa-sections";
import { breadcrumbJsonLd } from "../jsonld";
import { visaCheck } from "../season-guides";
import { pageMetadata } from "../site";

const check = visaCheck();

export const metadata = pageMetadata({
  title: "Visa & entry — Nigeria and Ghana",
  description: `Visa and entry notes for Detty December travel to Lagos, Calabar (Nigeria) and Accra (Ghana), repeating the linked Nigeria Immigration Service and Ghana Immigration Service pages. Check date ${check.checkedAtLabel}. US, UK, and Canada traveller pages included. No visa application or payment on this site.`,
  path: "/visa",
});

export default function VisaPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Visa", path: "/visa" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Visa" },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-brass">
        Official pages · check date {check.checkedAtLabel}
      </p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        Visa and entry
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">
        For diaspora visitors planning Detty December or a West Africa trip. {disclaimer}
      </p>
      <VisaSections headingLevel="h1" />
      <section className="mt-12 border-t border-ink/10 pt-8">
        <h2 className="font-display text-3xl leading-tight tracking-tight">
          By passport
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Same official immigration sources, framed for travellers from these countries. Check
          date {check.checkedAtLabel}.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {check.nationalityPages.map((page) => (
            <li key={page.slug}>
              <Link
                href={page.path}
                className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {page.travellerLabel}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-10 text-sm leading-7 text-muted">
        <Link href="/guide" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Full tourist guide
        </Link>
        {" · "}
        <Link
          href="/guides"
          className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
        >
          Season guides {check.checkedAt.slice(0, 4)}
        </Link>
        {" · "}
        <Link href="/detty-december" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Detty December hub
        </Link>
        {" · "}
        <Link href="/faq" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          FAQ
        </Link>
        {" · "}
        <Link href="/flights" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Flights
        </Link>
      </p>
    </main>
  );
}
