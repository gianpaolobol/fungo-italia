import assert from "node:assert/strict";
import test from "node:test";

import { calculateForecast } from "./forecast.ts";
import type { Area } from "./domain.ts";
import type { WeatherSnapshot } from "./weather.ts";

const area: Area = {
  id: "appennino-modenese",
  name: "Appennino modenese",
  region: "Emilia-Romagna",
  center: [44.28, 10.83],
  habitat: ["Faggeta", "Castagneto"],
  moisture: 82,
  temperatureFit: 86,
  seasonFit: 80,
  verifiedSignals: 74,
  delayedVisitors: 2,
  lastUpdatedLabel: "dataset beta",
  expectedTaxa: ["boletus-edulis"],
  reasons: ["Faggeta e castagneto"],
};

const freshWeather: WeatherSnapshot = {
  observedAt: "2026-09-16T11:45:00.000Z",
  expiresAt: "2026-09-16T15:00:00.000Z",
  temperatureC: 15,
  relativeHumidity: 82,
  precipitation7dMm: 42,
  precipitation14dMm: 67,
  precipitation26dMm: 96,
  meanTemperature20dC: 13.2,
  waterBalance14dMm: 34,
  precipitationProbability: 70,
  et0Mm: 2.2,
  latitude: 44.3,
  longitude: 10.8,
  elevationM: 920,
  source: "open-meteo",
};

test("forecast is bounded, explainable, and keeps supported taxon identifiers", () => {
  const result = calculateForecast(area, freshWeather, new Date("2026-09-16T12:00:00.000Z"));
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.deepEqual(result.expectedTaxa, ["boletus-edulis"]);
  assert.ok(result.reasons.length >= 3);
  assert.equal(result.components.weatherFit !== null, true);
  assert.equal(result.components.fruitingTriggerFit !== null, true);
  assert.ok(result.components.speciesPhenologyFit > 60);
  assert.ok(result.components.altitudeSeasonFit > 0);
  assert.equal(result.confidence, "high");
});

test("stale weather lowers confidence without inventing a zero weather score", () => {
  const result = calculateForecast(area, freshWeather, new Date("2026-09-17T12:00:00.000Z"));
  assert.equal(result.confidence, "low");
  assert.equal(result.components.weatherFit, null);
  assert.ok(result.reasons.some((reason) => reason.code === "weather-stale"));
});

test("missing weather produces a degraded but usable forecast", () => {
  const result = calculateForecast(area, null, new Date("2026-09-16T12:00:00.000Z"));
  assert.equal(result.confidence, "low");
  assert.equal(result.providerStatus, "degraded");
  assert.equal(result.components.weatherFit, null);
  assert.ok(result.score > 0);
});

test("high anonymous pressure reduces the recommendation", () => {
  const lowPressure = calculateForecast(area, freshWeather, new Date("2026-09-16T12:00:00.000Z"));
  const highPressure = calculateForecast({ ...area, delayedVisitors: 40 }, freshWeather, new Date("2026-09-16T12:00:00.000Z"));
  assert.ok(highPressure.score < lowPressure.score);
  assert.ok(highPressure.components.pressurePenalty > lowPressure.components.pressurePenalty);
});
