import Link from "next/link";
import { loadNews } from "../news-reader";

const sectionClass = "scroll-mt-36 border-b border-ink/10";

export function HomeNewsFallback() {
  return (
    <section id="news-updates" aria-labelledby="home-news-heading" className={sectionClass} aria-busy="true">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Public feeds</p>
        <h2 id="home-news-heading" className="mt-2 font-display text-3xl leading-none tracking-tight md:text-4xl">
          News & updates
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">Loading headlines from the feeds already on file.</p>
      </div>
    </section>
  );
}

export async function HomeNewsCard() {
  let items: Awaited<ReturnType<typeof loadNews>>["news"] = [];
  try {
    const payload = await loadNews();
    items = payload.news;
  } catch {
    items = [];
  }

  return (
    <section id="news-updates" aria-labelledby="home-news-heading" className={sectionClass}>
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.28em] text-lagoon">Public feeds</p>
            <h2 id="home-news-heading" className="mt-2 font-display text-3xl leading-none tracking-tight md:text-4xl">
              News & updates
            </h2>
          </div>
          <Link href="/news" className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-oxide">
            All news
          </Link>
        </div>
        {items.length > 0 ? (
          <ul
            className="mt-5 grid gap-3 sm:grid-cols-3"
            aria-label="Headlines from the public feeds"
          >
            {items.slice(0, 3).map((item) => (
              <li key={item.link} className="min-w-0 border border-ink/15 bg-chart">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full px-4 py-3 hover:bg-paper-deep/70"
                >
                  <span className="text-[10px] uppercase tracking-[0.16em] text-oxide">{item.source}</span>
                  <span className="mt-1 block text-sm leading-6 text-ink">{item.headline}</span>
                  {item.published ? (
                    <time className="mt-1 block text-xs text-muted">{item.published}</time>
                  ) : null}
                  <span className="sr-only"> Leaves this site.</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 border border-dashed border-ink/30 bg-chart px-4 py-5 text-sm leading-6 text-muted">
            No headlines to show.{" "}
            <Link href="/news" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
              News & updates
            </Link>{" "}
            checks the same feeds.
          </p>
        )}
      </div>
    </section>
  );
}
