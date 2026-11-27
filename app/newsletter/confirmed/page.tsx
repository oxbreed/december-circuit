import Link from "next/link";
import { pageMetadata } from "../../site";
import { JsonLd } from "../../components/json-ld";
import { breadcrumbJsonLd } from "../../jsonld";

export const metadata = pageMetadata({
    title: "Email confirmed",
    description:
      "Your Dirty December email signup is confirmed. The Lagos December events checklist is on its way.",
    path: "/newsletter/confirmed",
    robots: { index: false, follow: false },
});

export default function NewsletterConfirmedPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Email confirmed", path: "/newsletter/confirmed" },
        ])}
      />
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">Email list</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        You&apos;re on the list
      </h1>
      <p className="mt-6 text-base leading-7 text-ink">
        Your email is confirmed. The Lagos December events checklist is on its way
        to that inbox, from hello@dirtydecember.info. After that you&apos;ll get weekly
        picks, then a daily Lagos brief from 15 December to 1 January. You can
        unsubscribe from any of those emails.
      </p>
      <p className="mt-6">
        <Link
          href="/events"
          className="inline-flex h-11 items-center bg-oxide px-4 text-[11px] uppercase tracking-[0.16em] text-chart"
        >
          See the events list
        </Link>
      </p>
    </main>
  );
}
