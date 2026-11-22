"use client";

import { lazy, Suspense, useCallback, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SupportChat = lazy(() => import("./support-chat").then((module) => ({ default: module.SupportChat })));
const buttonClass = "mobile-dock-action lg:border lg:border-ink/15 lg:bg-paper lg:px-4 lg:py-3 lg:text-sm lg:shadow-md";

export function SupportLauncher({ liveModel }: { liveModel: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const panelId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    toggle.current?.focus();
  }, []);

  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/preview/admin")
    || pathname === "/sign-in" || pathname.startsWith("/sign-in/") || pathname.startsWith("/auth/")) return null;

  return (
    <div className="support-chat">
      <div className="support-chat-inner">
        {requested && (
          <Suspense fallback={open ? <p role="status" className="support-chat-panel bg-chart p-4 text-sm">Opening support…</p> : null}>
            <SupportChat liveModel={liveModel} open={open} onClose={close} panelId={panelId} />
          </Suspense>
        )}
        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-haspopup="dialog"
          className={buttonClass}
          onClick={() => {
            if (open) close();
            else {
              setRequested(true);
              setOpen(true);
            }
          }}
        >
          <span className="lg:hidden">{open ? "Close" : "Help"}</span>
          <span className="hidden lg:inline">{open ? "Close support" : "Ask support"}</span>
        </button>
      </div>
    </div>
  );
}
