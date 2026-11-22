import Link from "next/link";
import { seasonNews } from "../home-news-filter";
import { loadNews } from "../news-reader";
import { HomeSection, homeCard } from "./home-section";

export function HomeNewsFallback() {
  return (
    <HomeSection
      id="news-updates"
      number="06"
      kicker="Public feeds"
      title="News & updates"
      titleId="home-news-heading"
      lede="Loading headlines from the feeds already on file."
      busy
    />
  );
}

export async function HomeNewsCard() {
  let items: Awaited<ReturnType<typeof loadNews>>["news"] = [];
  try {
    const payload = await loadNews();
    items = seasonNews(payload.news);
  } catch {
    items = [];
  }

  return (
    <HomeSection
      id="news-updates"
      number="06"
      kicker="Public feeds"
      title="News & updates"
      titleId="home-news-heading"
      action={{ href: "/news", label: "All news" }}
    >
      {items.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-3" aria-label="Headlines from the public feeds">
          {items.slice(0, 3).map((item) => (
            <li key={item.link} className={`min-w-0 ${homeCard}`}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full px-4 py-3 hover:bg-paper-deep/70"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-oxide">{item.source}</span>
                <span className="mt-1 block text-sm leading-6 text-ink">{item.headline}</span>
                {item.published ? <time className="mt-1 block text-xs text-muted">{item.published}</time> : null}
                <span className="sr-only"> Leaves this site.</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border border-dashed border-ink/30 bg-chart px-4 py-5 text-sm leading-6 text-muted">
          No season headlines right now.{" "}
          <Link href="/news" className="text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            News & updates
          </Link>{" "}
          has every headline from the same feeds.
        </p>
      )}
    </HomeSection>
  );
}
