import test from "node:test";
import assert from "node:assert/strict";

import { aggregateCoordinates, normalizeProposedTaxonId, validateObservation } from "./observation.ts";

test("public observation coordinates are aggregated to a broad grid", () => {
  assert.deepEqual(aggregateCoordinates(44.2831, 10.8377), { lat: 44.3, lng: 10.9 });
  assert.deepEqual(aggregateCoordinates(44.2902, 10.8481), { lat: 44.3, lng: 10.9 });
});

test("observation validation requires useful evidence and valid coordinates", () => {
  assert.deepEqual(validateObservation({
    description: "",
    observedAt: "2026-09-16",
    latitude: 94,
    longitude: 10.8,
    photoCount: 0,
  }), [
    "Descrivi habitat e caratteri osservati (almeno 20 caratteri).",
    "Inserisci coordinate valide.",
    "Allega almeno una fotografia.",
  ]);
});

test("a complete observation is accepted for review", () => {
  assert.deepEqual(validateObservation({
    description: "Tre esemplari sotto faggio, lattice assente e odore lieve.",
    observedAt: "2026-09-16",
    latitude: 44.28,
    longitude: 10.83,
    photoCount: 3,
  }), []);
});

test("an unknown proposed taxon cannot create an invalid database reference", () => {
  const allowed = new Set(["boletus-edulis", "morchella"]);
  assert.equal(normalizeProposedTaxonId("boletus-edulis", allowed), "boletus-edulis");
  assert.equal(normalizeProposedTaxonId("invented-taxon", allowed), null);
  assert.equal(normalizeProposedTaxonId("", allowed), null);
});
