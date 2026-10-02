import { calculateForecast, type ForecastResult } from "./forecast.ts";
import type { Area } from "./domain.ts";

export type RankedArea = {
  area: Area;
  forecast: ForecastResult;
};

export function rankAreas(
  areas: Area[],
  forecasts: ForecastResult[],
  filters: { query: string; region: string },
): RankedArea[] {
  const byArea = new Map(forecasts.map((forecast) => [forecast.areaId, forecast]));
  const normalizedQuery = filters.query.trim().toLocaleLowerCase("it");

  return areas
    .filter((area) => {
      if (filters.region !== "Tutta Italia" && area.region !== filters.region) return false;
      if (!normalizedQuery) return true;
      return [area.name, area.region, ...area.habitat]
        .join(" ")
        .toLocaleLowerCase("it")
        .includes(normalizedQuery);
    })
    .map((area) => ({
      area,
      forecast: byArea.get(area.id) ?? calculateForecast(area, null),
    }))
    .sort((left, right) => (
      right.forecast.score - left.forecast.score ||
      left.area.name.localeCompare(right.area.name, "it")
    ));
}
