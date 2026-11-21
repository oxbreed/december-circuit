"use client";

import { lazy, Suspense, useEffect, useState } from "react";

const NewsTicker = lazy(() => import("./news-ticker").then((module) => ({ default: module.NewsTicker })));

export function DesktopNewsTicker() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    let timer: number | undefined;
    function schedule() {
      window.clearTimeout(timer);
      if (!desktop.matches) {
        setReady(false);
      } else if (document.readyState === "complete") {
        timer = window.setTimeout(() => setReady(true), 800);
      }
    }
    document.addEventListener("readystatechange", schedule);
    desktop.addEventListener("change", schedule);
    schedule();
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("readystatechange", schedule);
      desktop.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div className="hidden min-h-7 lg:block">
      {ready && <Suspense fallback={null}><NewsTicker /></Suspense>}
    </div>
  );
}
