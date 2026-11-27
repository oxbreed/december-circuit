import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { SeoArticleDraft } from "../seo-article-drafts";
import { JsonLd } from "./json-ld";
import { SeasonGuideShell } from "./season-guide-chrome";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLdFor,
} from "../jsonld";
import { pageMetadata } from "../site";

const linkClass =
  "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

export function seoArticleMetadata(article: SeoArticleDraft) {
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: article.path,
    type: "article",
    image: {
      url: article.image.src,
      alt: article.image.alt,
      width: article.image.width,
      height: article.image.height,
    },
  });
}

function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const label = match[1];
    const href = match[2];
    if (isInternalHref(href)) {
      nodes.push(
        <Link key={`l-${index}`} href={href} className={linkClass}>
          {label}
        </Link>,
      );
    } else {
      nodes.push(
        <a
          key={`l-${index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {label}
        </a>,
      );
    }
    index += 1;
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes;
}

function renderBody(body: string) {
  const blocks = body.split(/\n\n+/);
  return blocks.map((block, index) => {
    const text = block.trim();
    if (!text) return null;

    if (text.startsWith("## ")) {
      const heading = text.slice(3).trim();
      const id = heading === "FAQ" ? "faq" : undefined;
      return (
        <h2
          key={index}
          id={id}
          className="mt-14 border-t border-ink/10 pt-10 font-display text-3xl tracking-tight first:mt-0 first:border-0 first:pt-0"
        >
          {heading}
        </h2>
      );
    }

    if (text.startsWith("### ")) {
      return (
        <h3
          key={index}
          className="mt-8 font-display text-2xl tracking-tight"
        >
          {text.slice(4).trim()}
        </h3>
      );
    }

    const lines = text.split("\n");
    if (lines.every((line) => line.startsWith("- "))) {
      return (
        <ul
          key={index}
          className="mt-5 list-disc space-y-2 pl-5 text-base leading-7"
        >
          {lines.map((line, itemIndex) => (
            <li key={itemIndex}>{renderInline(line.slice(2))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index} className="mt-5 max-w-3xl text-base leading-7">
        {renderInline(text.replace(/\n/g, " "))}
      </p>
    );
  });
}

export function SeoArticlePage({ article }: { article: SeoArticleDraft }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: article.heading, path: article.path },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          path: article.path,
          headline: article.title,
          description: article.description,
          image: article.image.src,
          datePublished: article.published,
        })}
      />
      <JsonLd data={faqPageJsonLdFor(article.path, article.faqs)} />
      <SeasonGuideShell
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: article.heading },
        ]}
        kicker={article.kicker}
        title={article.heading}
        lede={article.description}
        currentPath={article.path}
      >
        <figure className="mt-10 max-w-3xl">
          <Image
            src={article.image.src}
            alt={article.image.alt}
            width={article.image.width}
            height={article.image.height}
            className="h-auto w-full object-cover"
            priority
          />
          <figcaption className="mt-2 text-xs leading-5 text-muted">
            {article.image.caption}
          </figcaption>
        </figure>
        <article className="mt-2 max-w-3xl">{renderBody(article.body)}</article>
      </SeasonGuideShell>
    </>
  );
}
