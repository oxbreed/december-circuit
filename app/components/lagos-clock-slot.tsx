import { Suspense } from "react";
import { io } from "next/cache";
import { lagosStamp } from "../lagos-time";
import { LagosClock } from "./lagos-clock";

function LagosClockFallback() {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <p className="shrink-0 font-sans text-base font-medium uppercase tracking-[0.18em] text-lagoon">
        Lagos
      </p>
      <p aria-hidden="true" className="font-mono text-4xl font-medium leading-none tabular-nums text-ink">
        <span className="inline-block min-w-[11ch]">&nbsp;</span>
      </p>
    </div>
  );
}

async function LiveLagosClock() {
  await io();
  return <LagosClock initial={lagosStamp(new Date())} />;
}

export function LagosClockSlot() {
  return (
    <Suspense fallback={<LagosClockFallback />}>
      <LiveLagosClock />
    </Suspense>
  );
}
