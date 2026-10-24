import "server-only";

import { cacheLife } from "next/cache";
import type { CityWeather } from "./city-weather";
import { pins } from "./pins";

const CITIES = [
  {
    city: "Lagos",
    pin: "Tafawa Balewa Square",
    centre: { latitude: 6.4541, longitude: 3.3947 },
  },
  {
    city: "Accra",
    pin: "Makola Market",
    centre: { latitude: 5.55, longitude: -0.2 },
  },
  {
    city: "Calabar",
    pin: "Millennium Park",
    centre: { latitude: 4.9583, longitude: 8.3267 },
  },
] as const;

type WeatherPoint = {
  city: CityWeather["city"];
  latitude: number;
  longitude: number;
};

const GOOGLE_TYPES: Record<string, string> = {
  CLEAR: "Clear",
  MOSTLY_CLEAR: "Fair",
  PARTLY_CLOUDY: "Cloudy",
  MOSTLY_CLOUDY: "Cloudy",
  CLOUDY: "Overcast",
  WINDY: "Windy",
  WIND_AND_RAIN: "Rain",
  LIGHT_RAIN: "Rain",
  RAIN: "Rain",
  HEAVY_RAIN: "Rain",
  LIGHT_TO_MODERATE_RAIN: "Rain",
  MODERATE_TO_HEAVY_RAIN: "Rain",
  RAIN_PERIODICALLY_HEAVY: "Rain",
  LIGHT_RAIN_SHOWERS: "Showers",
  CHANCE_OF_SHOWERS: "Showers",
  SCATTERED_SHOWERS: "Showers",
  RAIN_SHOWERS: "Showers",
  HEAVY_RAIN_SHOWERS: "Showers",
  LIGHT_SNOW: "Snow",
  SNOW: "Snow",
  HEAVY_SNOW: "Snow",
  LIGHT_TO_MODERATE_SNOW: "Snow",
  MODERATE_TO_HEAVY_SNOW: "Snow",
  SNOWSTORM: "Snow",
  BLOWING_SNOW: "Snow",
  RAIN_AND_SNOW: "Snow",
  LIGHT_SNOW_SHOWERS: "Snow",
  SCATTERED_SNOW_SHOWERS: "Snow",
  SNOW_SHOWERS: "Snow",
  HEAVY_SNOW_SHOWERS: "Snow",
  HAIL: "Hail",
  HAIL_SHOWERS: "Hail",
  THUNDERSTORM: "Storm",
  THUNDERSHOWER: "Storm",
  LIGHT_THUNDERSTORM_RAIN: "Storm",
  SCATTERED_THUNDERSTORMS: "Storm",
  HEAVY_THUNDERSTORM: "Storm",
  THUNDERSTORM_HAIL: "Storm",
  FOG: "Fog",
  MIST: "Mist",
  HAZE: "Haze",
  SMOKE: "Smoke",
  DUST: "Dust",
};

function weatherPoints(): WeatherPoint[] {
  return CITIES.map((city) => {
    const cityPins = pins.filter((pin) => pin.city === city.city);
    const pin = cityPins.find((item) => item.name === city.pin) ?? cityPins[0];
    if (!pin) {
      return { city: city.city, latitude: city.centre.latitude, longitude: city.centre.longitude };
    }
    return { city: city.city, latitude: pin.latitude, longitude: pin.longitude };
  });
}

function googleWeatherKey(): string | null {
  const dynamic = Object.keys(process.env).filter((name) => {
    if (name.startsWith("NEXT_PUBLIC_")) return false;
    const upper = name.toUpperCase();
    return (
      upper.includes("GOOGLE") &&
      (upper.includes("WEATHER") || upper.includes("MAP")) &&
      (upper.includes("KEY") || upper.includes("TOKEN"))
    );
  });
  const names = [
    "GOOGLE_WEATHER_API_KEY",
    "GOOGLE_MAPS_API_KEY",
    "GOOGLE_MAPS_WEATHER_API_KEY",
    "GOOGLE_MAPS_KEY",
    ...dynamic,
  ];
  const seen = new Set<string>();
  for (const name of names) {
    if (seen.has(name)) continue;
    seen.add(name);
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}

function asCelsius(value: unknown, unit: string | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (unit && unit !== "°C" && unit !== "CELSIUS") return null;
  return Math.round(value);
}

function conditionFromCode(code: number): string | null {
  if (code === 0) return "Clear";
  if (code === 1) return "Fair";
  if (code === 2) return "Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code === 51 || code === 53 || code === 55) return "Drizzle";
  if (code === 56 || code === 57 || code === 66 || code === 67) return "Ice";
  if (code === 61 || code === 63 || code === 65) return "Rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95 && code <= 99) return "Storm";
  return null;
}

function shortGoogleCondition(text: string | undefined, type: string | undefined): string | null {
  const trimmed = text?.trim() ?? "";
  if (/^[A-Za-z]{3,10}$/.test(trimmed)) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }
  if (type && GOOGLE_TYPES[type]) return GOOGLE_TYPES[type];
  return null;
}

function complete(points: WeatherPoint[], readings: Array<CityWeather | null>): CityWeather[] {
  if (readings.length !== points.length) return [];
  const rows: CityWeather[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const reading = readings[index];
    if (!reading || reading.city !== points[index]?.city) return [];
    rows.push(reading);
  }
  return rows;
}

type GoogleCurrent = {
  temperature?: { degrees?: number; unit?: string };
  weatherCondition?: { description?: { text?: string }; type?: string };
};

async function googleCity(point: WeatherPoint, key: string): Promise<CityWeather | null> {
  const url = new URL("https://weather.googleapis.com/v1/currentConditions:lookup");
  url.searchParams.set("key", key);
  url.searchParams.set("location.latitude", String(point.latitude));
  url.searchParams.set("location.longitude", String(point.longitude));
  url.searchParams.set("unitsSystem", "METRIC");
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as GoogleCurrent;
    const celsius = asCelsius(body.temperature?.degrees, body.temperature?.unit);
    const condition = shortGoogleCondition(
      body.weatherCondition?.description?.text,
      body.weatherCondition?.type,
    );
    if (celsius === null || !condition) return null;
    return { city: point.city, celsius, condition };
  } catch {
    return null;
  }
}

async function readGoogle(): Promise<CityWeather[]> {
  const key = googleWeatherKey();
  if (!key) return [];
  const points = weatherPoints();
  const readings = await Promise.all(points.map((point) => googleCity(point, key)));
  return complete(points, readings);
}

type OpenMeteoPlace = {
  current?: { temperature_2m?: number; weather_code?: number };
  current_units?: { temperature_2m?: string };
};

function fromOpenMeteo(point: WeatherPoint, payload: unknown): CityWeather | null {
  if (!payload || typeof payload !== "object") return null;
  const place = payload as OpenMeteoPlace;
  const celsius = asCelsius(place.current?.temperature_2m, place.current_units?.temperature_2m);
  const code = place.current?.weather_code;
  if (celsius === null || typeof code !== "number") return null;
  const condition = conditionFromCode(code);
  if (!condition) return null;
  return { city: point.city, celsius, condition };
}

async function readOpenMeteo(): Promise<CityWeather[]> {
  const points = weatherPoints();
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", points.map((point) => String(point.latitude)).join(","));
  url.searchParams.set("longitude", points.map((point) => String(point.longitude)).join(","));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "DecemberCircuit/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    const body: unknown = await response.json();
    const list = Array.isArray(body) ? body : [body];
    return complete(
      points,
      points.map((point, index) => fromOpenMeteo(point, list[index])),
    );
  } catch {
    return [];
  }
}

async function cachedWeather(source: "google" | "open-meteo"): Promise<CityWeather[]> {
  "use cache";
  cacheLife({ stale: 1800, revalidate: 1800, expire: 1800 });
  const rows = source === "google" ? await readGoogle() : await readOpenMeteo();
  if (rows.length !== CITIES.length) throw new Error("weather unavailable");
  return rows;
}

export async function loadCityWeather(): Promise<CityWeather[]> {
  return cachedWeather(googleWeatherKey() ? "google" : "open-meteo");
}
