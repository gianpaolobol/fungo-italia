import assert from "node:assert/strict";
import test from "node:test";

import { buildForecastBatch } from "./forecast-service.ts";
import type { Area } from "./domain.ts";
import type { WeatherSnapshot } from "./weather.ts";

const areas: Area[] = [
  {
    id: "a1",
    name: "Area uno",
    region: "Emilia-Romagna",
    center: [44.2, 10.8],
    habitat: ["Faggeta"],
    moisture: 70,
    temperatureFit: 75,
    seasonFit: 80,
    verifiedSignals: 65,
    delayedVisitors: 1,
    lastUpdatedLabel: "beta",
    expectedTaxa: ["taxon-1"],
    reasons: [],
  },
  {
    id: "a2",
    name: "Area due",
    region: "Toscana",
    center: [43.8, 11.8],
    habitat: ["Castagneto"],
    moisture: 68,
    temperatureFit: 72,
    seasonFit: 75,
    verifiedSignals: 60,
    delayedVisitors: 3,
    lastUpdatedLabel: "beta",
    expectedTaxa: ["taxon-2"],
    reasons: [],
  },
];

const snapshot: WeatherSnapshot = {
  observedAt: "2026-09-16T11:00:00.000Z",
  expiresAt: "2026-09-16T15:00:00.000Z",
  temperatureC: 15,
  relativeHumidity: 80,
  precipitation7dMm: 30,
  precipitation14dMm: 60,
  precipitation26dMm: 92,
  meanTemperature20dC: 13.8,
  waterBalance14dMm: 28,
  precipitationProbability: 55,
  et0Mm: 2,
  latitude: 44.2,
  longitude: 10.8,
  elevationM: 800,
  source: "open-meteo",
};

test("batch forecast degrades a failed area without exposing coordinates", async () => {
  const batch = await buildForecastBatch(
    areas,
    async (area) => {
      if (area.id === "a2") throw new Error("provider down");
      return snapshot;
    },
    new Date("2026-09-16T12:00:00.000Z"),
  );

  assert.equal(batch.providerStatus, "partial");
  assert.equal(batch.forecasts.length, 2);
  assert.equal(batch.forecasts[1].providerStatus, "degraded");
  assert.deepEqual(batch.forecasts[0].weather, {
    temperatureC: 15,
    relativeHumidity: 80,
    precipitation7dMm: 30,
    precipitation14dMm: 60,
    precipitation26dMm: 92,
    meanTemperature20dC: 13.8,
    waterBalance14dMm: 28,
    precipitationProbability: 55,
    elevationM: 800,
    source: "open-meteo",
  });
  assert.equal("center" in batch.forecasts[0], false);
  assert.equal(JSON.stringify(batch).includes("44.2"), false);
});
