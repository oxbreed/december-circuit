import Link from "next/link";
import type { ReactNode } from "react";
import { disclaimer } from "../brand";
import { faqItems } from "../faq-items";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Plain answers for diaspora visitors planning three to fourteen days in Lagos, Accra, and Calabar.",
  path: "/faq",
});

const linkClass =
  "underline decoration-ink/30 underline-offset-4 hover:text-oxide";

function renderAnswer(answer: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(answer)) !== null) {
    if (match.index > last) {
      nodes.push(<span key={`t-${key++}`}>{answer.slice(last, match.index)}</span>);
    }
    const href = match[1];
    const label = match[2];
    if (href.startsWith("mailto:")) {
      nodes.push(
        <a key={`a-${key++}`} href={href} className={linkClass}>
          {label}
        </a>,
      );
    } else {
      nodes.push(
        <Link key={`l-${key++}`} href={href} className={linkClass}>
          {label}
        </Link>,
      );
    }
    last = match.index + match[0].length;
  }

  if (last < answer.length) {
    nodes.push(<span key={`t-${key++}`}>{answer.slice(last)}</span>);
  }

  return nodes;
}

export default function FaqPage() {
  return (
    <main id="top" className="mx-auto w-full max-w-3xl px-5 pb-28 pt-28 md:px-8 md:pt-32">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brass">FAQ</p>
      <h1 className="mt-4 font-display text-5xl leading-none tracking-tight md:text-6xl">
        FAQ
      </h1>
      <p className="mt-6 text-base leading-7 text-muted">{disclaimer}</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-ink">
        {faqItems.map((item) => (
          <div key={item.question}>
            <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
              {item.question}
            </h2>
            <p className="mt-4">{renderAnswer(item.answer)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
