"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { CityWeather } from "../city-weather";
import { lagosStamp, type LagosStamp } from "../lagos-time";

const CITIES = ["Lagos", "Accra", "Calabar"] as const;

function rowsFor(weather: CityWeather[] | null): CityWeather[] {
  if (!weather) return [];
  const rows = CITIES.flatMap((city) => {
    const match = weather.find((item) => item.city === city);
    return match ? [match] : [];
  });
  return rows.length === CITIES.length ? rows : [];
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

function WeatherRow({ rows }: { rows: CityWeather[] }) {
  return (
    <ul
      aria-label="Current weather"
      className="flex shrink-0 items-baseline gap-1 border-l border-ink/15 pl-1 lg:items-center lg:gap-5 lg:self-stretch lg:pl-5"
    >
      {rows.map((item) => (
        <li
          key={item.city}
          className="flex shrink-0 items-baseline gap-0.5 whitespace-nowrap lg:block lg:min-w-0"
        >
          <p className="font-sans text-[9px] font-medium leading-none text-muted lg:text-[10px] lg:uppercase lg:tracking-[0.14em]">
            {item.city}
          </p>
          <p className="font-sans text-[10px] font-medium leading-none tabular-nums text-ink lg:mt-0.5 lg:text-[13px]">
            {item.celsius}°C
          </p>
          <p className="mt-0.5 hidden font-sans text-[10px] leading-none text-muted lg:block">
            {item.condition}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Readout({
  iso,
  clock,
  dayPeriod,
  weekday,
  date,
  weekdayShort,
  dateShort,
}: {
  iso?: string;
  clock: string;
  dayPeriod: string;
  weekday: string;
  date: string;
  weekdayShort: string;
  dateShort: string;
}) {
  const body = (
    <>
      <span className="min-w-0">
        <span className="hidden font-sans text-[9px] font-medium uppercase leading-none tracking-[0.22em] text-lagoon lg:block">
          Lagos
        </span>
        <span className="flex items-baseline gap-1 lg:mt-0.5 lg:gap-1.5">
          <span
            suppressHydrationWarning
            className="inline-block min-w-[8ch] whitespace-nowrap font-mono text-base font-medium leading-none tabular-nums tracking-tight text-ink lg:text-4xl"
          >
            {clock || "\u00a0"}
          </span>
          <span
            suppressHydrationWarning
            className="inline-block min-w-[2ch] font-sans text-[9px] font-medium uppercase leading-none tracking-[0.08em] text-ink lg:text-[11px] lg:tracking-[0.16em]"
          >
            {dayPeriod || "\u00a0"}
          </span>
        </span>
      </span>
      <span
        suppressHydrationWarning
        className="shrink-0 whitespace-nowrap font-sans text-[10px] leading-none text-ink lg:text-sm lg:leading-5"
      >
        <span className="lg:hidden">
          {weekdayShort && dateShort ? `${weekdayShort} ${dateShort}` : "\u00a0"}
        </span>
        <span className="hidden lg:inline">
          {weekday && date ? `${weekday}, ${date}` : "\u00a0"}
        </span>
      </span>
    </>
  );
  const className = "flex shrink-0 items-baseline gap-1 lg:items-end lg:gap-6";
  if (!iso) return <div className={className}>{body}</div>;
  return (
    <time dateTime={iso} suppressHydrationWarning className={className}>
      {body}
    </time>
  );
}

function ClockShell({ children, weather }: { children: ReactNode; weather: CityWeather[] | null }) {
  const rows = rowsFor(weather);
  return (
    <div className="mx-auto flex h-full w-full min-w-0 max-w-6xl items-center justify-between gap-1 px-2 sm:px-3 lg:gap-6 lg:px-6">
      {children}
      {rows.length > 0 ? <WeatherRow rows={rows} /> : null}
    </div>
  );
}

export function LagosClockFallback() {
  return (
    <ClockShell weather={null}>
      <Readout clock="" dayPeriod="" weekday="" date="" weekdayShort="" dateShort="" />
    </ClockShell>
  );
}

export function LagosClock({
  initial,
  weather,
}: {
  initial: LagosStamp;
  weather: CityWeather[] | null;
}) {
  const stamp = useLagosTick(initial);
  return (
    <ClockShell weather={weather}>
      <Readout
        iso={stamp.iso}
        clock={stamp.clock}
        dayPeriod={stamp.dayPeriod}
        weekday={stamp.weekday}
        date={stamp.date}
        weekdayShort={stamp.weekdayShort}
        dateShort={stamp.dateShort}
      />
    </ClockShell>
  );
}
