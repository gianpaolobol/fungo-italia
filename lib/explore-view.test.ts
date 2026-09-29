import assert from "node:assert/strict";
import test from "node:test";

import { rankAreas } from "./explore-view.ts";
import type { Area } from "./domain.ts";
import type { ForecastResult } from "./forecast.ts";

const area = (id: string, name: string, region: string): Area => ({
  id,
  name,
  region,
  center: [44, 11],
  habitat: ["Faggeta"],
  moisture: 70,
  temperatureFit: 70,
  seasonFit: 70,
  verifiedSignals: 60,
  delayedVisitors: 2,
  lastUpdatedLabel: "beta",
  expectedTaxa: [],
  reasons: [],
});

const forecast = (areaId: string, score: number): ForecastResult => ({
  areaId,
  score,
  recommendation: score >= 75 ? "Vai ora" : score >= 52 ? "Possibile" : "Attendi",
  confidence: "medium",
  providerStatus: "live",
  calculatedAt: "2026-09-16T12:00:00.000Z",
  weatherObservedAt: "2026-09-16T11:00:00.000Z",
  expectedTaxa: [],
  components: {
    ecologicalSuitability: score,
    phenologyFit: score,
    weatherFit: score,
    fruitingTriggerFit: score,
    rainHistoryFit: score,
    speciesPhenologyFit: score,
    altitudeSeasonFit: score,
    evidenceScore: score,
    pressurePenalty: 0,
  },
  reasons: [],
});

test("areas rank by current forecast and remain stable on equal scores", () => {
  const areas = [
    area("b", "Bosco B", "Toscana"),
    area("a", "Bosco A", "Emilia-Romagna"),
    area("c", "Bosco C", "Lazio"),
  ];
  const ranked = rankAreas(areas, [
    forecast("a", 80),
    forecast("b", 80),
    forecast("c", 40),
  ], { query: "", region: "Tutta Italia" });

  assert.deepEqual(ranked.map((entry) => entry.area.id), ["a", "b", "c"]);
});

test("region and habitat query filters are combined", () => {
  const areas = [
    area("a", "Bosco A", "Emilia-Romagna"),
    { ...area("b", "Bosco B", "Toscana"), habitat: ["Castagneto"] },
  ];
  const ranked = rankAreas(areas, [], {
    query: "castagneto",
    region: "Toscana",
  });
  assert.deepEqual(ranked.map((entry) => entry.area.id), ["b"]);
});

test("an area without live forecast remains visible with degraded confidence", () => {
  const ranked = rankAreas(
    [area("a", "Bosco A", "Emilia-Romagna")],
    [],
    { query: "", region: "Tutta Italia" },
  );
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].forecast.confidence, "low");
});
