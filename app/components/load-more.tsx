"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

/** Initial page size: fewer rows on narrow viewports so mobile does not dump a wall. */
export function useListPageSize(mobileSize = 6, desktopSize = 12) {
  const [size, setSize] = useState(desktopSize);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setSize(mq.matches ? mobileSize : desktopSize);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mobileSize, desktopSize]);

  return size;
}

export function LoadMoreBar({
  shown,
  total,
  hasMore,
  onMore,
  noun = "on file",
}: {
  shown: number;
  total: number;
  hasMore: boolean;
  onMore: () => void;
  noun?: string;
}) {
  if (total === 0) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <p className="text-sm text-muted">
        Showing {Math.min(shown, total)} of {total}
        {noun ? ` ${noun}` : ""}
      </p>
      {hasMore ? (
        <button
          type="button"
          className="bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-chart"
          onClick={onMore}
        >
          Load more
        </button>
      ) : null}
    </div>
  );
}

export function LoadMoreList<T>({
  items,
  mobileSize = 6,
  desktopSize = 12,
  noun,
  children,
}: {
  items: T[];
  mobileSize?: number;
  desktopSize?: number;
  noun?: string;
  children: (visible: T[]) => ReactNode;
}) {
  const pageSize = useListPageSize(mobileSize, desktopSize);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, items]);

  const pageRows = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <>
      {children(pageRows)}
      <LoadMoreBar
        shown={visibleCount}
        total={items.length}
        hasMore={hasMore}
        noun={noun}
        onMore={() => setVisibleCount((count) => count + pageSize)}
      />
    </>
  );
}
