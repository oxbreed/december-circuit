"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { FaqItem } from "../faq-items";
import { LoadMoreList } from "./load-more";

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

export function FaqLoadMore({ items }: { items: FaqItem[] }) {
  return (
    <LoadMoreList items={items} mobileSize={6} desktopSize={12} noun="questions">
      {(visible) => (
        <div className="mt-8 space-y-4 text-base leading-7 text-ink">
          {visible.map((item) => (
            <div key={item.question}>
              <h2 className="pt-8 font-display text-3xl leading-none tracking-tight">
                {item.question}
              </h2>
              <p className="mt-4">{renderAnswer(item.answer)}</p>
            </div>
          ))}
        </div>
      )}
    </LoadMoreList>
  );
}