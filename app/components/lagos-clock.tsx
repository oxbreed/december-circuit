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
    <ul aria-label="Current weather" className="grid grid-cols-3 gap-3 border-t border-ink/10 pt-4">
      {rows.map((item) => (
        <li key={item.city} className="min-w-0">
          <p className="font-sans text-[10px] font-medium uppercase leading-none tracking-[0.14em] text-muted">
            {item.city}
          </p>
          <p className="mt-2 font-sans text-lg font-medium leading-none tabular-nums text-ink">
            {item.celsius}°C
          </p>
          <p className="mt-1.5 font-sans text-xs leading-4 text-muted">{item.condition}</p>
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
      <p className="font-sans text-[10px] font-medium uppercase leading-none tracking-[0.22em] text-lagoon">
        Lagos
      </p>
      <p className="mt-2 flex items-baseline gap-2">
        <span
          suppressHydrationWarning
          className="inline-block min-w-[7.5ch] whitespace-nowrap font-mono text-[1.65rem] font-medium leading-none tabular-nums tracking-tight text-ink sm:text-3xl"
        >
          {clock || "\u00a0"}
        </span>
        <span
          suppressHydrationWarning
          className="inline-block min-w-[2ch] font-sans text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-ink"
        >
          {dayPeriod || "\u00a0"}
        </span>
      </p>
      <p
        suppressHydrationWarning
        className="mt-2 font-sans text-sm leading-5 text-ink"
      >
        {weekday && date ? `${weekday}, ${date}` : "\u00a0"}
      </p>
    </>
  );
  if (!iso) return <div>{body}</div>;
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {body}
    </time>
  );
}

function ClockShell({ children, weather }: { children: ReactNode; weather: CityWeather[] | null }) {
  const rows = rowsFor(weather);
  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-4">
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
