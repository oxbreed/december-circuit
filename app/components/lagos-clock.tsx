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
      className="mt-2 grid grid-cols-3 gap-x-2 border-t border-ink/15 pt-2 lg:mt-0 lg:flex lg:items-center lg:gap-6 lg:self-stretch lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0"
    >
      {rows.map((item) => (
        <li key={item.city} className="min-w-0">
          <p className="whitespace-nowrap font-sans text-[10px] font-medium uppercase leading-none tracking-[0.14em] text-muted">
            {item.city}
          </p>
          <p className="mt-1 whitespace-nowrap font-sans text-sm font-medium leading-none tabular-nums text-ink">
            {item.celsius}°C
          </p>
          <p className="mt-1 whitespace-nowrap font-sans text-[11px] leading-none text-muted">
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
}: {
  iso?: string;
  clock: string;
  dayPeriod: string;
  weekday: string;
  date: string;
}) {
  const body = (
    <>
      <span className="min-w-0">
        <span className="block font-sans text-[10px] font-medium uppercase leading-none tracking-[0.22em] text-lagoon">
          Lagos
        </span>
        <span className="mt-1 flex items-baseline gap-2">
          <span
            suppressHydrationWarning
            className="inline-block min-w-[8ch] whitespace-nowrap font-mono text-4xl font-medium leading-none tabular-nums tracking-tight text-ink lg:text-5xl"
          >
            {clock || "\u00a0"}
          </span>
          <span
            suppressHydrationWarning
            className="inline-block min-w-[2ch] font-sans text-[11px] font-medium uppercase leading-none tracking-[0.16em] text-ink lg:text-xs"
          >
            {dayPeriod || "\u00a0"}
          </span>
        </span>
      </span>
      <span
        suppressHydrationWarning
        className="shrink-0 text-right font-sans text-sm leading-4 text-ink lg:text-base lg:leading-5"
      >
        <span className="block whitespace-nowrap lg:hidden">{weekday || "\u00a0"}</span>
        <span className="block whitespace-nowrap lg:hidden">{date || "\u00a0"}</span>
        <span className="hidden whitespace-nowrap lg:inline">
          {weekday && date ? `${weekday}, ${date}` : "\u00a0"}
        </span>
      </span>
    </>
  );
  const className = "flex min-w-0 items-end justify-between gap-3 lg:justify-start lg:gap-8";
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
    <div className="mx-auto flex h-full w-full min-w-0 max-w-6xl flex-col justify-center px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      {children}
      {rows.length > 0 ? <WeatherRow rows={rows} /> : null}
    </div>
  );
}

export function LagosClockFallback() {
  return (
    <ClockShell weather={null}>
      <Readout clock="" dayPeriod="" weekday="" date="" />
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
      />
    </ClockShell>
  );
}
