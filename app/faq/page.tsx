import Link from "next/link";
import { disclaimer } from "../brand";
import { Breadcrumbs } from "../components/breadcrumbs";
import { FaqLoadMore } from "../components/faq-load-more";
import { JsonLd } from "../components/json-ld";
import { faqItems } from "../faq-items";
import { breadcrumbJsonLd, faqPageJsonLd } from "../jsonld";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "FAQ — Detty December & West Africa travel",
  description:
    "Plain answers for diaspora visitors planning Detty December or a West Africa trip: Lagos, Accra, and Calabar events, visas, flights, maps, and outbound bookings. No payment on this site.",
  path: "/faq",
});

const linkClass =
  "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

export default function FaqPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <JsonLd data={faqPageJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "FAQ" },
        ]}
      />
      <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-brass">FAQ</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        Visitor FAQ
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">
        Answers for Detty December and West Africa travel planning — events, visas, flights,
        maps, and listings. {disclaimer}
      </p>
      <FaqLoadMore items={faqItems} />
      <p className="mt-12 text-sm leading-7 text-muted">
        <Link href="/guide" className={linkClass}>
          Tourist guide
        </Link>
        {" · "}
        <Link href="/events" className={linkClass}>
          Confirmed events
        </Link>
        {" · "}
        <Link href="/cities" className={linkClass}>
          Cities
        </Link>
      </p>
    </main>
  );
}
