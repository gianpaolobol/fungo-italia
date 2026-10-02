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
  weather?: {
    temperatureC: number | null;
    relativeHumidity: number | null;
    precipitation7dMm: number | null;
    precipitation14dMm: number | null;
    precipitation26dMm: number | null;
    meanTemperature20dC: number | null;
    waterBalance14dMm: number | null;
    precipitationProbability: number | null;
    elevationM: number | null;
    source: WeatherSnapshot["source"];
  } | null;
  expectedTaxa: string[];
  components: {
    ecologicalSuitability: number;
    phenologyFit: number;
    weatherFit: number | null;
    fruitingTriggerFit: number | null;
    rainHistoryFit: number | null;
    speciesPhenologyFit: number;
    altitudeSeasonFit: number;
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

const taxonActiveMonths: Readonly<Record<string, readonly number[]>> = {
  "boletus-edulis": [6, 7, 8, 9, 10, 11],
  "russula-cyanoxantha": [6, 7, 8, 9, 10],
  "russula-vesca": [6, 7, 8, 9, 10],
  "russula-virescens": [6, 7, 8, 9, 10],
  "craterellus-cornucopioides": [8, 9, 10, 11],
  "hygrophorus-marzuolus": [1, 2, 3, 4],
  "lactarius-deliciosi": [8, 9, 10, 11],
  "tricholoma-terreum-group": [9, 10, 11, 12],
  "pleurotus-eryngii": [1, 2, 3, 4, 10, 11, 12],
  "agaricus-campestris-group": [4, 5, 6, 7, 8, 9, 10, 11],
  "marasmius-oreades": [4, 5, 6, 7, 8, 9, 10],
  "amanita-vaginatae": [6, 7, 8, 9, 10],
  "morchella": [3, 4, 5],
  "verpa": [3, 4, 5],
  "pleurotus-ostreatus": [10, 11, 12, 1, 2],
  "flammulina-velutipes": [11, 12, 1, 2],
};

function circularMonthDistance(month: number, activeMonth: number) {
  const delta = Math.abs(month - activeMonth);
  return Math.min(delta, 12 - delta);
}

function calculateSpeciesPhenologyFit(area: Area, now: Date) {
  const month = now.getUTCMonth() + 1;
  const scores = area.expectedTaxa.flatMap((taxonId) => {
    const months = taxonActiveMonths[taxonId];
    if (!months?.length) return [];
    const distance = Math.min(...months.map((activeMonth) => circularMonthDistance(month, activeMonth)));
    return [distance === 0 ? 100 : distance === 1 ? 64 : distance === 2 ? 28 : 8];
  });
  if (scores.length === 0) return clamp(area.seasonFit);
  const dynamic = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  return clamp(dynamic * 0.78 + area.seasonFit * 0.22);
}

function calculateAltitudeSeasonFit(area: Area, weather: WeatherSnapshot | null, now: Date) {
  const elevation =
    weather?.elevationM ??
    (area.elevationRangeM ? (area.elevationRangeM[0] + area.elevationRangeM[1]) / 2 : null);
  if (elevation === null) return 70;
  const month = now.getUTCMonth() + 1;
  const target =
    month >= 6 && month <= 8 ? 1250 :
    month >= 9 && month <= 11 ? 850 :
    month >= 3 && month <= 5 ? 650 :
    400;
  const tolerance = month >= 6 && month <= 8 ? 1200 : 1050;
  return clamp(100 - (Math.abs(elevation - target) / tolerance) * 55);
}

function calculateWeatherFit(weather: WeatherSnapshot) {
  const components: number[] = [];
  if (weather.relativeHumidity !== null) components.push(clamp(weather.relativeHumidity));
  if (weather.precipitation14dMm !== null) {
    const rain = weather.precipitation14dMm;
    components.push(clamp(25 + rain * 1.15));
  }
  if (weather.et0Mm !== null) components.push(clamp(100 - weather.et0Mm * 12));
  if (components.length < 2) return null;
  return clamp(components.reduce((sum, value) => sum + value, 0) / components.length);
}

function calculateRainHistoryFit(weather: WeatherSnapshot) {
  const rain7 = weather.precipitation7dMm;
  const rain14 = weather.precipitation14dMm;
  const rain26 = weather.precipitation26dMm;
  if (rain7 === null || rain14 === null || rain26 === null) return null;

  const previous7 = Math.max(0, rain14 - rain7);
  const earlier12 = Math.max(0, rain26 - rain14);
  // This is an intentionally broad heuristic: it rewards moisture built over
  // multiple weeks instead of a single storm and caps extreme rainfall.
  const recent = clamp(Math.min(rain7, 45) * 1.55 + 24);
  const prior = clamp(Math.min(previous7, 45) * 1.15 + 28);
  const background = clamp(Math.min(earlier12, 70) * 0.72 + 24);
  return clamp(recent * 0.42 + prior * 0.34 + background * 0.24);
}

function calculateFruitingTriggerFit(area: Area, weather: WeatherSnapshot) {
  const temperature =
    weather.meanTemperature20dC ??
    weather.temperatureC;
  const rainfall = weather.precipitation26dMm ?? weather.precipitation14dMm;
  if (temperature === null || rainfall === null) return null;

  // B. edulis is the best-supported species-specific case in the current model:
  // recent monitoring associates peak fruiting with ~13 C over ~20 days and
  // increasing precipitation accumulated over ~26 days. Other taxa use a
  // deliberately broader generic temperature response until species-specific
  // Italian calibrations are available.
  const hasPorcini = area.expectedTaxa.includes("boletus-edulis");
  const targetTemperature = hasPorcini ? 13 : 14;
  const temperatureTolerance = hasPorcini ? 9 : 12;
  const temperatureScore = clamp(
    100 - (Math.abs(temperature - targetTemperature) / temperatureTolerance) * 100,
  );
  const rainScore = clamp(28 + rainfall * (hasPorcini ? 0.9 : 0.72));
  const waterBalanceScore =
    weather.waterBalance14dMm === null
      ? null
      : clamp(55 + weather.waterBalance14dMm * 1.6);

  const weighted: Array<[number, number]> = [
    [temperatureScore, 0.38],
    [rainScore, 0.47],
  ];
  if (waterBalanceScore !== null) weighted.push([waterBalanceScore, 0.15]);
  const totalWeight = weighted.reduce((sum, [, weight]) => sum + weight, 0);
  return clamp(weighted.reduce((sum, [value, weight]) => sum + value * weight, 0) / totalWeight);
}

export function calculateForecast(
  area: Area,
  weather: WeatherSnapshot | null,
  now = new Date(),
): ForecastResult {
  const ecologicalSuitability = clamp((area.moisture + area.temperatureFit) / 2);
  const speciesPhenologyFit = calculateSpeciesPhenologyFit(area, now);
  const phenologyFit = speciesPhenologyFit;
  const measuredSignals = area.signalProvenance === "measured";
  const evidenceScore = measuredSignals ? clamp(area.verifiedSignals) : 0;
  const penalty = measuredSignals ? pressurePenalty(area.delayedVisitors) : 0;
  const weatherIsFresh = Boolean(weather && new Date(weather.expiresAt).getTime() >= now.getTime());
  const weatherFit = weather && weatherIsFresh ? calculateWeatherFit(weather) : null;
  const fruitingTriggerFit = weather && weatherIsFresh ? calculateFruitingTriggerFit(area, weather) : null;
  const rainHistoryFit = weather && weatherIsFresh ? calculateRainHistoryFit(weather) : null;
  const altitudeSeasonFit = calculateAltitudeSeasonFit(area, weather && weatherIsFresh ? weather : null, now);

  const weighted: Array<[number, number]> = [
    [ecologicalSuitability, 0.23],
    [speciesPhenologyFit, 0.18],
    [altitudeSeasonFit, 0.09],
    ...(measuredSignals ? [[evidenceScore, 0.14] as [number, number]] : []),
  ];
  if (weatherFit !== null) weighted.push([weatherFit, 0.07]);
  if (rainHistoryFit !== null) weighted.push([rainHistoryFit, 0.08]);
  if (fruitingTriggerFit !== null) weighted.push([fruitingTriggerFit, 0.20]);
  const totalWeight = weighted.reduce((sum, [, weight]) => sum + weight, 0);
  const baseScore = weighted.reduce((sum, [value, weight]) => sum + value * weight, 0) / totalWeight;
  const score = clamp(baseScore - penalty);
  const providerStatus = weatherFit === null ? "degraded" : "live";
  const confidence: ForecastConfidence =
    weatherFit !== null && evidenceScore >= 70
      ? "high"
      : weatherFit !== null
        ? measuredSignals ? "medium" : "low"
        : "low";

  const reasons: ForecastReason[] = [
    {
      code: "habitat-fit",
      label: `${area.habitat.slice(0, 3).join(", ")}: compatibilità ambientale indicativa`,
      tone: "positive",
    },
    {
      code: "phenology-fit",
      label: `Fenologia delle specie attese ${phenologyFit}/100`,
      tone: phenologyFit >= 65 ? "positive" : "neutral",
    },
    {
      code: "visitor-pressure",
      label: measuredSignals ? `Pressione di ricerca: ${getVisitPressure(area.delayedVisitors)} passaggi aggregati` : "Pressione di ricerca non monitorata: nessun conteggio disponibile",
      tone: penalty >= 12 ? "warning" : "neutral",
    },
  ];

  if (!measuredSignals) reasons.push({ code: "heuristic-model", label: "Indice euristico non validato sul campo: meteo e habitat non confermano presenza o abbondanza di funghi", tone: "warning" });

  if (rainHistoryFit !== null) {
    reasons.push({
      code: "rain-history",
      label: `Andamento piogge 7/14/26 giorni: ${rainHistoryFit}/100`,
      tone: rainHistoryFit >= 68 ? "positive" : rainHistoryFit < 38 ? "warning" : "neutral",
    });
  }
  if (fruitingTriggerFit !== null) {
    reasons.push({
      code: "fruiting-trigger",
      label: `Compatibilità euristica pioggia/temperatura: ${fruitingTriggerFit}/100`,
      tone: fruitingTriggerFit >= 68 ? "positive" : fruitingTriggerFit < 40 ? "warning" : "neutral",
    });
  }
  reasons.push({
    code: "altitude-season",
    label: `Compatibilità quota/stagione: ${altitudeSeasonFit}/100`,
    tone: altitudeSeasonFit >= 65 ? "positive" : altitudeSeasonFit < 35 ? "warning" : "neutral",
  });

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
    recommendation: score >= 75 && measuredSignals && weatherFit !== null ? "Vai ora" : score >= 52 ? "Possibile" : "Attendi",
    confidence,
    providerStatus,
    calculatedAt: now.toISOString(),
    weatherObservedAt: weather?.observedAt ?? null,
    weather: weather && weatherIsFresh ? {
      temperatureC: weather.temperatureC,
      relativeHumidity: weather.relativeHumidity,
      precipitation7dMm: weather.precipitation7dMm,
      precipitation14dMm: weather.precipitation14dMm,
      precipitation26dMm: weather.precipitation26dMm,
      meanTemperature20dC: weather.meanTemperature20dC,
      waterBalance14dMm: weather.waterBalance14dMm,
      precipitationProbability: weather.precipitationProbability,
      elevationM: weather.elevationM,
      source: weather.source,
    } : null,
    expectedTaxa: [...area.expectedTaxa],
    components: {
      ecologicalSuitability,
      phenologyFit,
      weatherFit,
      fruitingTriggerFit,
      rainHistoryFit,
      speciesPhenologyFit,
      altitudeSeasonFit,
      evidenceScore,
      pressurePenalty: penalty,
    },
    reasons,
  };
}
