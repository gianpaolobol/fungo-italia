import assert from "node:assert/strict";
import test from "node:test";

import type { LearningTaxonConcept, LearningUnit } from "./learning-taxonomy.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import {
  COMPLETE_MINIMUM_UNIT_TARGET,
  CURRENT_MINIMUM_CONCEPT_TARGET,
  validateMinimumLearningInventory,
} from "./learning-taxonomy.ts";

function concept(id: string, rank: LearningTaxonConcept["rank"] = "species"): LearningTaxonConcept {
  return {
    id,
    acceptedScientificName: id.replaceAll("-", " "),
    rank,
    aliases: [],
  };
}

function unit(
  id: string,
  currentConceptId: string,
  overrides: Partial<LearningUnit> = {},
): LearningUnit {
  return {
    id,
    sourceHeadingId: "objective-test",
    sourceLabel: id.replaceAll("-", " "),
    sourcePage: 4,
    level: "minimum",
    requiredResolution: "species",
    currentConceptId,
    deepMorphologyRequired: false,
    reviewStatus: "normalized",
    ...overrides,
  };
}

test("beta cardinality invariants stay explicit", () => {
  assert.equal(COMPLETE_MINIMUM_UNIT_TARGET, 148);
  assert.equal(CURRENT_MINIMUM_CONCEPT_TARGET, 141);
});

test("the curated source inventory contains exactly the 148 minimum learning units", () => {
  assert.equal(sourceMinimumLearningUnits.length, COMPLETE_MINIMUM_UNIT_TARGET);

  const result = validateMinimumLearningInventory(sourceMinimumLearningUnits, [], {
    expectedUnits: COMPLETE_MINIMUM_UNIT_TARGET,
    requireCompleteMapping: false,
  });

  assert.equal(result.ok, true, result.errors.join("\\n"));
  assert.equal(result.unitCount, 148);
  assert.equal(result.conceptCount, 0);
});

test("learning units can converge on one current taxon without being discarded", () => {
  const concepts = [concept("cyclocybe-cylindracea")];
  const units = [
    unit("source-agrocybe-aegerita", "cyclocybe-cylindracea"),
    unit("source-cyclocybe-cylindracea", "cyclocybe-cylindracea"),
  ];

  const result = validateMinimumLearningInventory(units, concepts, {
    expectedUnits: 2,
    expectedConcepts: 1,
  });

  assert.equal(result.ok, true);
  assert.equal(result.unitCount, 2);
  assert.equal(result.conceptCount, 1);
});

test("sensu lato, section and subgenus source units cannot be flattened to species", () => {
  const concepts = [
    concept("amanita-excelsa-group", "speciesGroup"),
    concept("agaricus-xanthodermatei", "section"),
    concept("cortinarius-dermocybe", "subgenus"),
  ];
  const units = [
    unit("amanita-excelsa-sl", "amanita-excelsa-group", {
      sourceLabel: "Amanita excelsa s.l.",
      requiredResolution: "species",
    }),
    unit("agaricus-xanthodermatei", "agaricus-xanthodermatei", {
      sourceLabel: "Agaricus sez. Xanthodermatei",
      requiredResolution: "species",
    }),
    unit("cortinarius-dermocybe", "cortinarius-dermocybe", {
      sourceLabel: "Cortinarius sottogenere Dermocybe",
      requiredResolution: "species",
    }),
  ];

  const result = validateMinimumLearningInventory(units, concepts, {
    expectedUnits: 3,
    expectedConcepts: 3,
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.includes("sensu-lato")), true);
  assert.equal(result.errors.some((error) => error.includes("section unit")), true);
  assert.equal(result.errors.some((error) => error.includes("subgenus unit")), true);
});

test("known prose fragments from the legacy regex parser are rejected", () => {
  const concepts = [concept("artifact")];
  const result = validateMinimumLearningInventory(
    [
      unit("artifact", "artifact", {
        sourceLabel: "Ramaria colorate",
      }),
    ],
    concepts,
    { expectedUnits: 1, expectedConcepts: 1 },
  );

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /parser prose artifact/);
});

test("release-grade validation can require approved review status", () => {
  const concepts = [concept("amanita-phalloides")];
  const result = validateMinimumLearningInventory(
    [unit("amanita-phalloides", "amanita-phalloides")],
    concepts,
    {
      expectedUnits: 1,
      expectedConcepts: 1,
      requireApproved: true,
    },
  );

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /not approved/);
});
