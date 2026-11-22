import Link from "next/link";
import { homeCard } from "./home-section";
import { visitorCategoryCountLine, type VisitorCategoryEntry } from "../visitor-categories";

export function HomeCategoryStrip({ entries }: { entries: VisitorCategoryEntry[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {entries.map((item) => (
        <li key={item.slug} className="min-w-0">
          <Link
            href={`/categories/${item.slug}`}
            className={`motion-lift block h-full ${homeCard} p-4 hover:border-oxide/40`}
          >
            <span className="block font-display text-xl leading-tight tracking-tight">{item.category}</span>
            <span className="mt-2 block text-sm leading-6 text-muted">
              {visitorCategoryCountLine(item.count, item.exploreKind)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
