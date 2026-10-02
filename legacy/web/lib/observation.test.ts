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

test("invalid calendar dates and future observations are rejected", () => {
  const complete = { description: "Tre esemplari sotto faggio, base del gambo intera.", observedAt: "2026-10-02T10:00", latitude: 42.89, longitude: 11.63, photoCount: 1 };
  const now = new Date("2026-10-02T12:00:00Z");
  for (const observedAt of ["invalid", "2026-02-30", "2026-13-01", "2026-10-02T25:00", "2026-10-05"]) {
    assert.ok(validateObservation({ ...complete, observedAt }, now).some(error => error.includes("data")), observedAt);
  }
  assert.deepEqual(validateObservation(complete, now), []);
});
test("non-finite coordinates and impossible photo counts are rejected", () => {
  const complete = { description: "Tre esemplari sotto faggio, base del gambo intera.", observedAt: "2026-10-01", latitude: 42.89, longitude: 11.63, photoCount: 1 };
  assert.ok(validateObservation({ ...complete, latitude: NaN }).some(error => error.includes("coordinate")));
  for (const photoCount of [NaN, 1.5, 7]) assert.ok(validateObservation({ ...complete, photoCount }).some(error => error.includes("fotografie")));
});

test("public grid centres remain inside geographic bounds at poles and antimeridian", () => {
  assert.deepEqual(aggregateCoordinates(90, 180), { lat: 89.9, lng: 179.9 });
  assert.deepEqual(aggregateCoordinates(-90, -180), { lat: -89.9, lng: -179.9 });
});
