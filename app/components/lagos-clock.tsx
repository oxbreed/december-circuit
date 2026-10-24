"use client";

import { useEffect, useState } from "react";
import { lagosStamp, type LagosStamp } from "../lagos-time";

function ClockFace({ stamp }: { stamp: LagosStamp }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <p className="shrink-0 font-sans text-base font-medium uppercase tracking-[0.18em] text-lagoon">
        Lagos
      </p>
      <time
        dateTime={stamp.iso}
        suppressHydrationWarning
        className="flex min-w-0 flex-col items-end gap-1 text-right text-ink"
      >
        <span
          suppressHydrationWarning
          className="whitespace-nowrap font-mono text-4xl font-medium leading-none tabular-nums tracking-tight"
        >
          {stamp.clock} {stamp.dayPeriod}
        </span>
        <span
          suppressHydrationWarning
          className="whitespace-nowrap font-sans text-xl leading-none"
        >
          {stamp.weekday}, {stamp.date}
        </span>
      </time>
    </div>
  );
}

function useLagosTick(initial: LagosStamp) {
  const [stamp, setStamp] = useState(initial);

  useEffect(() => {
    const update = () => setStamp(lagosStamp(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return stamp;
}

export function LagosClock({ initial }: { initial: LagosStamp }) {
  const stamp = useLagosTick(initial);
  return <ClockFace stamp={stamp} />;
}
