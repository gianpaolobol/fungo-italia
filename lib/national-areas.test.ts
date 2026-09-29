import assert from "node:assert/strict";
import test from "node:test";

import { betaAreas } from "./seed-data.ts";

test("national territorial search exposes 71 unique aggregate areas", () => {
  assert.equal(betaAreas.length, 71);
  assert.equal(new Set(betaAreas.map((area) => area.id)).size, 71);
});

test("aggregate areas cover all Italian regions without point-scale claims", () => {
  const regions = new Set(betaAreas.map((area) => area.region));
  const expected = [
    "Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia Giulia",
    "Lazio","Liguria","Lombardia","Marche","Molise","Piemonte","Puglia","Sardegna",
    "Sicilia","Toscana","Trentino-Alto Adige","Umbria","Valle d'Aosta","Veneto",
  ];
  for (const region of expected) assert.ok(regions.has(region), region);
  for (const area of betaAreas) {
    assert.ok(area.name.trim().length > 0, area.id);
    assert.ok(area.center[0] >= 35 && area.center[0] <= 48, area.id);
    assert.ok(area.center[1] >= 6 && area.center[1] <= 20, area.id);
    assert.ok(area.reasons.every((reason) => !/\b\d{1,2}\.\d{4,}\s*[,;]\s*\d{1,2}\.\d{4,}\b/.test(reason)), area.id);
  }
});

test("web-verified areas retain provenance and calibrated evidence scores", () => {
  const sourced = betaAreas.filter((area) => area.evidenceSources?.length);
  assert.ok(sourced.length >= 20);
  for (const area of sourced) {
    assert.ok(area.verifiedSignals >= 50 && area.verifiedSignals <= 100, area.id);
    for (const source of area.evidenceSources ?? []) {
      assert.match(source.url, /^https:\/\//, area.id);
      assert.ok(source.label.trim().length > 0, area.id);
    }
  }
});
