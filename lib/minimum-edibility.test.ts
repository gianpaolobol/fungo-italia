import assert from "node:assert/strict";
import test from "node:test";

import {
  allCatalogEvidence,
  edibilityEvidence,
  guardTaxonSensitiveFields,
} from "./catalog-evidence.ts";
import {
  minimumEdibilityAssessments,
  minimumEdibilityEvidence,
  validateMinimumEdibility,
} from "./minimum-edibility.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";

function byLabel(label: string) {
  const found = minimumEdibilityAssessments.find((item) => item.sourceLabel === label);
  assert.ok(found, `missing S2 assessment for ${label}`);
  return found;
}

test("all 148 minimum learning units have exactly one normalized S2 assessment", () => {
  assert.equal(sourceMinimumLearningUnits.length, 148);
  assert.equal(minimumEdibilityAssessments.length, 148);

  const result = validateMinimumEdibility();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.assessmentCount, 148);
  assert.equal(result.evidenceCount, 160);
  assert.equal(result.approvedCount, 0);
  assert.deepEqual(result.categoryCounts, {
    POISONOUS: 39,
    EDIBLE: 64,
    NOT_EDIBLE: 18,
    DISCOURAGED: 13,
    EDIBLE_AFTER_TREATMENT: 12,
    NOT_ASSESSED: 2,
  });
});

test("S2 corrections override tempting S1 or legacy food-status shortcuts", () => {
  assert.equal(byLabel("Lyophyllum connatum").category, "DISCOURAGED");
  assert.equal(byLabel("Gyroporus castaneus s.l.").category, "EDIBLE_AFTER_TREATMENT");
  assert.equal(byLabel("Clitocybe gibba s.l.").category, "EDIBLE_AFTER_TREATMENT");
  assert.equal(byLabel("Hygrophoropsis aurantiaca").category, "DISCOURAGED");
});

test("mixed teaching groups are not assigned a false uniform food category", () => {
  const luridi = byLabel("Boletus sez. Luridi");
  assert.equal(luridi.category, "NOT_ASSESSED");
  assert.equal(luridi.assessmentScope, "section");
  assert.match(luridi.conditionsSummary ?? "", /stati S2 differenti|taxa velenosi/i);

  const blackening = byLabel("Lyophyllum specie annerenti");
  assert.equal(blackening.category, "NOT_ASSESSED");
  assert.match(blackening.conditionsSummary ?? "", /eterogenea|specie commestibili/i);
});

test("conditional edibility always carries an explicit treatment claim", () => {
  const conditional = minimumEdibilityAssessments.filter(
    (item) => item.category === "EDIBLE_AFTER_TREATMENT",
  );
  assert.equal(conditional.length, 12);
  for (const item of conditional) {
    assert.equal(item.treatmentCodes.includes("completeCooking"), true, item.sourceLabel);
    assert.ok(item.conditionsSummary?.trim(), item.sourceLabel);
    const linked = minimumEdibilityEvidence.filter((evidence) =>
      item.evidenceIds.includes(evidence.evidenceId),
    );
    assert.equal(
      linked.filter((evidence) => evidence.claimType === "treatment").length,
      1,
      item.sourceLabel,
    );
  }
});

test("young-specimen restrictions are represented as specimen-stage data", () => {
  for (const label of [
    "Coprinus comatus",
    "Laetiporus sulphureus s.l.",
    "Albatrellus confluens",
    "Grifola frondosa",
    "Polyporus squamosus",
    "Ramaria botrytis s.l.",
  ]) {
    assert.equal(byLabel(label).specimenStage, "youngOnly", label);
  }
});

test("every S2 assessment evidence record is in the common provenance registry", () => {
  assert.equal(edibilityEvidence.length, 160);
  assert.equal(minimumEdibilityEvidence.length, 160);
  const ids = new Set(allCatalogEvidence.map((item) => item.evidenceId));
  for (const item of minimumEdibilityEvidence) {
    assert.equal(ids.has(item.evidenceId), true, item.evidenceId);
    assert.equal(item.sourceId, "source-s2-guida-commestibilita-2021");
    assert.equal(["edibility", "treatment"].includes(item.claimType), true);
  }
});

test("normalized S2 extraction does not bypass the later scientific approval gate", () => {
  const publication = validateMinimumEdibility(
    minimumEdibilityAssessments,
    minimumEdibilityEvidence,
    { requireApproved: true },
  );
  assert.equal(publication.ok, false);
  assert.match(publication.errors.join("\n"), /not approved/);

  const legacyTaxon = {
    id: "amanita-caesarea",
    commonName: "Ovolo buono",
    scientificName: "Amanita caesarea",
    rank: "species" as const,
    aliases: [],
    regionalNames: [],
    edibility: "commestibile" as const,
    safetyNote: "Legacy value",
  };
  const guarded = guardTaxonSensitiveFields(legacyTaxon);
  assert.equal(guarded.edibility, "non-valutato");
});

test("assessment validation catches page drift and missing evidence", () => {
  const first = minimumEdibilityAssessments[0];
  const badPage = validateMinimumEdibility(
    [{ ...first, sourceLocation: "p. 999 — wrong" }],
    minimumEdibilityEvidence.filter((item) => first.evidenceIds.includes(item.evidenceId)),
  );
  assert.equal(badPage.ok, false);
  assert.match(badPage.errors.join("\n"), /page drift|expected exactly one S2 assessment/);

  const missing = validateMinimumEdibility(
    [{ ...first, evidenceIds: ["missing-evidence"] }],
    [],
  );
  assert.equal(missing.ok, false);
  assert.match(missing.errors.join("\n"), /missing linked evidence/);
});
