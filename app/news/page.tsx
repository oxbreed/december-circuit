import { disclaimer } from "../brand";
import { NewsLoadMore } from "../components/news-load-more";
import { loadNews } from "../news-reader";
import { pageMetadata } from "../site";
import { JsonLd } from "../components/json-ld";
import { breadcrumbJsonLd } from "../jsonld";

export const metadata = pageMetadata({
  title: "News & updates",
  description:
    "News and updates for Detty December season reading — headlines and pictures from the public feeds already used on dirtydecember.info. A picture is shown only when that feed item includes one.",
  path: "/news",
});

export default async function NewsPage() {
  const payload = await loadNews();
  const items = payload.news;

  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "News", path: "/news" }])} />
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">News & updates</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        News & updates
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        <p>
          This is the full list. The home page keeps the same headlines in a short
          scrolling card. Dates, descriptions, and pictures come from the public
          feeds already on file. A picture is shown only when that feed item
          includes an image address. Opening an item leaves this site.
        </p>
        {items.length === 0 ? <p>News feeds did not return any items.</p> : null}
      </div>
      {items.length > 0 ? (
        <div className="mt-10">
          <NewsLoadMore items={items} />
        </div>
      ) : null}
    </main>
  );
}
