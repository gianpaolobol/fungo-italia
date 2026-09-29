import assert from "node:assert/strict";
import test from "node:test";

import { getResolution } from "h3-js";
import { areaToPublicFeature } from "./map-geometry.ts";
import type { Area } from "./domain.ts";
import type { ForecastResult } from "./forecast.ts";

const area: Area = {
  id: "test-area",
  name: "Area di prova",
  region: "Emilia-Romagna",
  center: [44.28, 10.83],
  habitat: ["Faggeta"],
  moisture: 80,
  temperatureFit: 80,
  seasonFit: 80,
  verifiedSignals: 70,
  delayedVisitors: 2,
  lastUpdatedLabel: "beta",
  expectedTaxa: ["boletus-edulis"],
  reasons: [],
};

const forecast: ForecastResult = {
  areaId: area.id,
  score: 78,
  recommendation: "Vai ora",
  confidence: "medium",
  providerStatus: "live",
  calculatedAt: "2026-09-16T12:00:00.000Z",
  weatherObservedAt: "2026-09-16T11:00:00.000Z",
  expectedTaxa: ["boletus-edulis"],
  components: {
    ecologicalSuitability: 80,
    phenologyFit: 80,
    weatherFit: 75,
    fruitingTriggerFit: 82,
    speciesPhenologyFit: 88,
    altitudeSeasonFit: 80,
    evidenceScore: 70,
    pressurePenalty: 4,
  },
  reasons: [],
};

test("public feature uses broad H3 resolution 5 and a closed GeoJSON ring", () => {
  const feature = areaToPublicFeature(area, forecast);
  assert.equal(getResolution(feature.properties.h3Index), 5);
  assert.deepEqual(
    feature.geometry.coordinates[0][0],
    feature.geometry.coordinates[0].at(-1),
  );
  const [longitude, latitude] = feature.geometry.coordinates[0][0];
  assert.ok(longitude > 5 && longitude < 20);
  assert.ok(latitude > 35 && latitude < 48);
});

test("public feature properties cannot expose raw coordinates or visitor counts", () => {
  const feature = areaToPublicFeature(area, forecast);
  const serialized = JSON.stringify(feature.properties);
  assert.equal(serialized.includes("center"), false);
  assert.equal(serialized.includes("delayedVisitors"), false);
  assert.equal(serialized.includes("private"), false);
  assert.equal(feature.properties.pressureBand, "pochi");
});
