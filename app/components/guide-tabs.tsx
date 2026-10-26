"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "entry", label: "Visa" },
  { id: "arrive", label: "Arrive" },
  { id: "stay", label: "Stay" },
  { id: "around", label: "Get around" },
  { id: "on", label: "What is on" },
] as const;

const SEEN_KEY = "dirtydecember-guide-tabs-seen";

function readSeen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function GuideTabs() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const [showProgress, setShowProgress] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(() => new Set([SECTIONS[0].id]));

  useEffect(() => {
    setShowProgress(!readSeen());

    const elements = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id;
        if (!top) return;
        setActiveId(top);
        setVisited((prev) => {
          if (prev.has(top)) return prev;
          const next = new Set(prev);
          next.add(top);
          return next;
        });
      },
      {
        rootMargin: "-28% 0px -55% 0px",
        threshold: [0.08, 0.2, 0.4],
      },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!showProgress) return;
    if (visited.size < SECTIONS.length) return;
    markSeen();
  }, [showProgress, visited]);

  const stepIndex = Math.max(
    0,
    SECTIONS.findIndex((section) => section.id === activeId),
  );
  const step = stepIndex + 1;

  function noteVisit(id: string) {
    setActiveId(id);
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  return (
    <div
      className="mt-5 border-y border-ink/10 bg-paper/95 py-3 backdrop-blur-md lg:sticky lg:z-30 lg:top-36"
    >
      {showProgress ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p
            className="text-[11px] uppercase tracking-[0.2em] text-lagoon"
            aria-live="polite"
          >
            Step {step} of {SECTIONS.length}
          </p>
          <button
            type="button"
            className="text-[11px] uppercase tracking-[0.16em] text-muted underline decoration-ink/25 underline-offset-4 hover:text-oxide"
            onClick={() => {
              markSeen();
              setShowProgress(false);
            }}
          >
            Hide steps
          </button>
          <div
            className="h-0.5 w-full overflow-hidden bg-ink/10"
            aria-hidden="true"
          >
            <div
              className="h-full bg-oxide transition-[width] duration-300 ease-out"
              style={{ width: `${(step / SECTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      ) : null}
      <nav aria-label="Guide" className="flex flex-wrap gap-2">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={section.id === activeId ? "location" : undefined}
            className="chip"
            onClick={() => noteVisit(section.id)}
          >
            {section.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
