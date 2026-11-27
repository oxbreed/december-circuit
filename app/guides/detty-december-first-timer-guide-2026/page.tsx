import { notFound } from "next/navigation";
import { SeoArticlePage, seoArticleMetadata } from "../../components/seo-article-page";
import { seoArticleBySlug } from "../../seo-article-drafts";

const slug = "detty-december-first-timer-guide-2026";
const article = seoArticleBySlug(slug);

export const metadata = article
  ? seoArticleMetadata(article)
  : { title: "Guide not found" };

export default function SeoArticleDraftPage() {
  if (!article) notFound();
  return <SeoArticlePage article={article} />;
}
