import test from "node:test";
import assert from "node:assert/strict";

import { betaAreas, betaTaxa } from "./seed-data.ts";
import { scoreArea } from "./domain.ts";

test("beta areas cover northern, central, southern, and island regions", () => {
  const regions = new Set(betaAreas.map((area) => area.region));
  assert.equal(regions.has("Trentino-Alto Adige"), true);
  assert.equal(regions.has("Emilia-Romagna"), true);
  assert.equal(regions.has("Basilicata"), true);
  assert.equal(regions.has("Sardegna"), true);
});

test("seed recommendations include an immediate option and explain every area", () => {
  assert.equal(betaAreas.some((area) => scoreArea(area).label === "Vai ora"), true);
  assert.equal(betaAreas.every((area) => area.reasons.length >= 2), true);
});

test("beta taxa keep regional names scoped to geography", () => {
  const pioppino = betaTaxa.find((taxon) => taxon.id === "cyclocybe-cylindracea");
  assert.deepEqual(pioppino?.regionalNames, [
    { name: "Piopparello", regions: ["Toscana", "Umbria"] },
    { name: "Fungo del pioppo", regions: ["Emilia-Romagna", "Veneto"] },
  ]);
});
