import test from "node:test";
import assert from "node:assert/strict";

import {
  formatTaxonLabel,
  getVisitPressure,
  scoreArea,
  type Area,
  type Taxon,
} from "./domain.ts";

test("visit pressure protects privacy by returning bands instead of exact counts", () => {
  assert.equal(getVisitPressure(0), "nessuno");
  assert.equal(getVisitPressure(2), "pochi");
  assert.equal(getVisitPressure(9), "alcuni");
  assert.equal(getVisitPressure(31), "molti");
});

test("area score stays bounded and high-quality low-pressure habitat becomes Vai ora", () => {
  const area: Area = {
    id: "appennino-modenese",
    name: "Appennino modenese",
    region: "Emilia-Romagna",
    center: [44.28, 10.83],
    habitat: ["Faggeta", "Abete bianco"],
    moisture: 88,
    temperatureFit: 90,
    seasonFit: 86,
    verifiedSignals: 82,
    delayedVisitors: 2,
    lastUpdatedLabel: "aggiornato con dati ritardati",
    expectedTaxa: ["boletus-edulis"],
    reasons: ["Umidità favorevole"],
  };

  assert.deepEqual(scoreArea(area), { score: 87, label: "Vai ora" });
  assert.equal(scoreArea({ ...area, moisture: 500 }).score, 100);
});

test("taxon label keeps the common and accepted scientific name together", () => {
  const taxon: Taxon = {
    id: "cyclocybe-cylindracea",
    commonName: "Pioppino",
    scientificName: "Cyclocybe cylindracea",
    rank: "species",
    aliases: ["Agrocybe aegerita"],
    regionalNames: [{ name: "Piopparello", regions: ["Toscana", "Umbria"] }],
    edibility: "commestibile",
    safetyNote: "Consumare soltanto esemplari correttamente identificati.",
  };

  assert.equal(formatTaxonLabel(taxon), "Pioppino · Cyclocybe cylindracea");
});
