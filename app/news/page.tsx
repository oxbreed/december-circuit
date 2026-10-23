import { disclaimer } from "../brand";
import { loadNews } from "../news-reader";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "News",
  description:
    "Entertainment headlines and pictures supplied by the public feeds already used for the ticker.",
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
        <div className="mt-10 space-y-10">
          {items.map((item) => (
            <article key={item.link} className="border-t border-ink/15 pt-8">
              {item.image ? (
                // The address is the feed’s own image URL. The optimizer is not used.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.headline}
                  className="mb-5 h-auto w-full"
                />
              ) : null}
              <p className="text-[11px] uppercase tracking-[0.18em] text-oxide">{item.source}</p>
              <h2 className="mt-2 font-display text-3xl leading-none tracking-tight">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  {item.headline}
                  <span className="mt-2 block font-sans text-sm font-normal normal-case tracking-normal text-muted">
                    Leaves this site
                  </span>
                </a>
              </h2>
              {item.published ? (
                <time className="mt-3 block text-sm leading-6 text-muted">{item.published}</time>
              ) : null}
              {item.description ? (
                <p className="mt-3 text-base leading-7 text-ink">{item.description}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}
