"use client";

import dynamic from "next/dynamic";

const SearchPageClient = dynamic(
  () => import("./search-page-client").then((mod) => mod.SearchPageClient),
  { ssr: false },
);

export function SearchPageSlot() {
  return <SearchPageClient />;
}
