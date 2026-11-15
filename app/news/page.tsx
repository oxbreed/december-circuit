import { disclaimer } from "../brand";
import { NewsLoadMore } from "../components/news-load-more";
import { loadNews } from "../news-reader";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "News — West Africa entertainment",
  description:
    "Entertainment and culture headlines for Detty December season reading — pictures and text from the public feeds already used on the dirtydecember.info ticker.",
  path: "/news",
});

export default async function NewsPage() {
  const payload = await loadNews();
  const items = payload.news;

  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">News</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        Entertainment headlines
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        <p>
          These headlines, dates, descriptions, and pictures come from the public
          feeds already used for the ticker. A picture is shown only when that
          feed item includes an image address. Opening an item leaves this site.
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
