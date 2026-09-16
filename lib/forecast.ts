import { getVisitPressure, type Area } from "./domain.ts";
import type { WeatherSnapshot } from "./weather.ts";

export type ForecastConfidence = "low" | "medium" | "high";
export type ForecastRecommendation = "Vai ora" | "Possibile" | "Attendi";

export type ForecastReason = {
  code: string;
  label: string;
  tone: "positive" | "neutral" | "warning";
};

export type ForecastResult = {
  areaId: string;
  score: number;
  recommendation: ForecastRecommendation;
  confidence: ForecastConfidence;
  providerStatus: "live" | "degraded";
  calculatedAt: string;
  weatherObservedAt: string | null;
  expectedTaxa: string[];
  components: {
    ecologicalSuitability: number;
    phenologyFit: number;
    weatherFit: number | null;
    evidenceScore: number;
    pressurePenalty: number;
  };
  reasons: ForecastReason[];
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function pressurePenalty(count: number) {
  const pressure = getVisitPressure(count);
  if (pressure === "molti") return 22;
  if (pressure === "alcuni") return 12;
  if (pressure === "pochi") return 4;
  return 0;
}

function calculateWeatherFit(weather: WeatherSnapshot) {
  const components: number[] = [];
  if (weather.temperatureC !== null) {
    components.push(clamp(100 - Math.abs(weather.temperatureC - 15) * 5));
  }
  if (weather.relativeHumidity !== null) components.push(clamp(weather.relativeHumidity));
  if (weather.precipitation14dMm !== null) {
    const rain = weather.precipitation14dMm;
    components.push(clamp(rain <= 60 ? 35 + rain : 95 - (rain - 60) * 0.45));
  }
  if (weather.et0Mm !== null) components.push(clamp(100 - weather.et0Mm * 12));
  if (components.length < 2) return null;
  return clamp(components.reduce((sum, value) => sum + value, 0) / components.length);
}

export function calculateForecast(
  area: Area,
  weather: WeatherSnapshot | null,
  now = new Date(),
): ForecastResult {
  const ecologicalSuitability = clamp((area.moisture + area.temperatureFit) / 2);
  const phenologyFit = clamp(area.seasonFit);
  const evidenceScore = clamp(area.verifiedSignals);
  const penalty = pressurePenalty(area.delayedVisitors);
  const weatherIsFresh = Boolean(weather && new Date(weather.expiresAt).getTime() >= now.getTime());
  const weatherFit = weather && weatherIsFresh ? calculateWeatherFit(weather) : null;

  const weighted: Array<[number, number]> = [
    [ecologicalSuitability, 0.35],
    [phenologyFit, 0.2],
    [evidenceScore, 0.2],
  ];
  if (weatherFit !== null) weighted.push([weatherFit, 0.25]);
  const totalWeight = weighted.reduce((sum, [, weight]) => sum + weight, 0);
  const baseScore = weighted.reduce((sum, [value, weight]) => sum + value * weight, 0) / totalWeight;
  const score = clamp(baseScore - penalty);
  const providerStatus = weatherFit === null ? "degraded" : "live";
  const confidence: ForecastConfidence =
    weatherFit !== null && evidenceScore >= 70
      ? "high"
      : weatherFit !== null
        ? "medium"
        : "low";

  const reasons: ForecastReason[] = [
    {
      code: "habitat-fit",
      label: `${area.habitat.slice(0, 3).join(", ")}: habitat compatibili nella scheda beta`,
      tone: "positive",
    },
    {
      code: "phenology-fit",
      label: `Compatibilità stagionale ${phenologyFit}/100`,
      tone: phenologyFit >= 65 ? "positive" : "neutral",
    },
    {
      code: "visitor-pressure",
      label: `Pressione di ricerca: ${getVisitPressure(area.delayedVisitors)} passaggi aggregati`,
      tone: penalty >= 12 ? "warning" : "neutral",
    },
  ];

  if (!weather) {
    reasons.push({
      code: "weather-unavailable",
      label: "Meteo non disponibile: previsione calcolata senza componente meteorologica",
      tone: "warning",
    });
  } else if (!weatherIsFresh) {
    reasons.push({
      code: "weather-stale",
      label: "Meteo scaduto: componente esclusa e confidenza ridotta",
      tone: "warning",
    });
  } else if (weatherFit === null) {
    reasons.push({
      code: "weather-incomplete",
      label: "Dati meteo incompleti: componente esclusa",
      tone: "warning",
    });
  } else {
    reasons.push({
      code: "weather-fit",
      label: `Condizioni meteo recenti: ${weatherFit}/100`,
      tone: weatherFit >= 65 ? "positive" : "neutral",
    });
  }

  return {
    areaId: area.id,
    score,
    recommendation: score >= 75 ? "Vai ora" : score >= 52 ? "Possibile" : "Attendi",
    confidence,
    providerStatus,
    calculatedAt: now.toISOString(),
    weatherObservedAt: weather?.observedAt ?? null,
    expectedTaxa: [...area.expectedTaxa],
    components: {
      ecologicalSuitability,
      phenologyFit,
      weatherFit,
      evidenceScore,
      pressurePenalty: penalty,
    },
    reasons,
  };
}
