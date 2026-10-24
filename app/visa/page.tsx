import Link from "next/link";
import { disclaimer } from "../brand";
import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import { VisaSections } from "../components/visa-sections";
import { breadcrumbJsonLd } from "../jsonld";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Visa & entry — Nigeria and Ghana",
  description:
    "Visa and entry notes for Detty December travel to Lagos, Calabar (Nigeria) and Accra (Ghana), repeating the linked Nigeria Immigration Service and Ghana Immigration Service pages. No visa application or payment on this site.",
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
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-brass">Official pages</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        Visa and entry
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">
        For diaspora visitors planning Detty December or a West Africa trip. {disclaimer}
      </p>
      <VisaSections headingLevel="h1" />
      <p className="mt-10 text-sm leading-7 text-muted">
        <Link href="/guide" className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
          Full tourist guide
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
