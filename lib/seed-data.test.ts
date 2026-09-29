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

test("national beta covers every Italian region with broad search areas", () => {
  const regions = new Set(betaAreas.map((area) => area.region));
  const expectedRegions = [
    "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
    "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
    "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
    "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto",
  ];

  assert.equal(betaAreas.length >= 50, true);
  assert.deepEqual([...regions].sort(), expectedRegions.sort());
  assert.equal(new Set(betaAreas.map((area) => area.id)).size, betaAreas.length);
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


test("web-verified additions keep explicit provenance instead of precise foraging coordinates", () => {
  const verified = betaAreas.filter((area) => area.evidenceSources?.length);
  assert.ok(verified.length >= 10);
  for (const area of verified) {
    assert.ok(area.evidenceSources?.every((source) => source.url.startsWith("https://")));
    assert.ok(area.reasons.length >= 2);
  }
});
