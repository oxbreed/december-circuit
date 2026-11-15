import { Suspense } from "react";
import { Breadcrumbs } from "../components/breadcrumbs";
import { JsonLd } from "../components/json-ld";
import { SearchPageSlot } from "../components/search-page-slot";
import { breadcrumbJsonLd } from "../jsonld";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Search",
  description:
    "Search confirmed events, organiser places, and season guide pages already on file at dirtydecember.info.",
  path: "/search",
});

export default function SearchPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-6xl px-5 pb-28 pt-28 md:px-8 md:pt-36 lg:pb-16">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Search", path: "/search" }])} />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Search" }]} />
      <Suspense fallback={<p className="mt-10 text-sm text-muted">Loading search…</p>}>
        <SearchPageSlot />
      </Suspense>
    </main>
  );
}
