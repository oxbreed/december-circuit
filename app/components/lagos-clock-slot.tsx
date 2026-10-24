import { Suspense } from "react";
import { io } from "next/cache";
import type { CityWeather } from "../city-weather";
import { lagosStamp } from "../lagos-time";
import { loadCityWeather } from "../weather";
import { LagosClock, LagosClockFallback } from "./lagos-clock";

async function LiveLagosClock() {
  await io();
  let weather: CityWeather[] | null = null;
  try {
    weather = await loadCityWeather();
  } catch {
    weather = null;
  }
  return <LagosClock initial={lagosStamp(new Date())} weather={weather} />;
}

export function LagosClockSlot() {
  return (
    <Suspense fallback={<LagosClockFallback />}>
      <LiveLagosClock />
    </Suspense>
  );
}
