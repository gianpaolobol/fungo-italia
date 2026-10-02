import { calculateForecast, type ForecastResult } from "./forecast.ts";
import type { Area } from "./domain.ts";
import type { WeatherSnapshot } from "./weather.ts";

export type WeatherLoader = (area: Area) => Promise<WeatherSnapshot>;

export type ForecastBatch = {
  generatedAt: string;
  providerStatus: "live" | "partial" | "degraded";
  forecasts: ForecastResult[];
};

export async function buildForecastBatch(
  areas: Area[],
  loadWeather: WeatherLoader,
  now = new Date(),
): Promise<ForecastBatch> {
  const settled = await Promise.allSettled(areas.map((area) => loadWeather(area)));
  let successCount = 0;
  const forecasts = areas.map((area, index) => {
    const result = settled[index];
    if (result.status === "fulfilled") {
      successCount += 1;
      return calculateForecast(area, result.value, now);
    }
    return calculateForecast(area, null, now);
  });

  return {
    generatedAt: now.toISOString(),
    providerStatus:
      successCount === areas.length ? "live" : successCount === 0 ? "degraded" : "partial",
    forecasts,
  };
}
