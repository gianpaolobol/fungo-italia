import assert from "node:assert/strict";
import test from "node:test";

import claimsJson from "../data/catalog/claims.json" with { type: "json" };
import evidenceJson from "../data/catalog/evidence.json" with { type: "json" };
import sourcesJson from "../data/catalog/sources.json" with { type: "json" };
import {
  evidenceById,
  validateCatalogClaims,
  validateCatalogEvidence,
  type CatalogClaimRecord,
  type CatalogSourceRecord,
  type EvidenceRecord,
} from "./catalog-evidence.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import { minimumNomenclatureMappings } from "./minimum-nomenclature.ts";

const sources = sourcesJson as CatalogSourceRecord[];
const evidence = evidenceJson as EvidenceRecord[];
const claims = claimsJson as CatalogClaimRecord[];

test("catalog sources and minimum evidence pass the provenance contract", () => {
  const result = validateCatalogEvidence(sources, evidence);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.sourceCount, 6);
  assert.ok(
    sources.some((source) => source.sourceId === "AUDIT-minimum-3plus1-baseline-1.0"),
  );
  assert.equal(result.evidenceCount, 148);
});

test("every minimum learning unit has exactly one training claim and one evidence record", () => {
  assert.equal(sourceMinimumLearningUnits.length, 148);
  assert.equal(claims.length, 148);
  assert.equal(evidence.length, 148);

  const bySubject = new Map<string, CatalogClaimRecord[]>();
  for (const claim of claims) {
    const list = bySubject.get(claim.subjectId) ?? [];
    list.push(claim);
    bySubject.set(claim.subjectId, list);
  }

  const evidenceMap = evidenceById(evidence);
  for (const unit of sourceMinimumLearningUnits) {
    const unitClaims = bySubject.get(unit.id) ?? [];
    assert.equal(unitClaims.length, 1, `expected one claim for ${unit.id}`);
    const claim = unitClaims[0];
    assert.equal(claim.subjectType, "learningUnit");
    assert.equal(claim.claimType, "training");
    assert.equal(claim.fieldPath, "training.minimum");
    assert.equal(claim.evidenceIds.length, 1);
    const item = evidenceMap.get(claim.evidenceIds[0]);
    assert.ok(item, `missing evidence for ${unit.id}`);
    assert.equal(item.claimType, "training");
    assert.equal(item.reviewStatus, "normalized");
    assert.match(item.sourceLocation, new RegExp(`pagina ${unit.sourcePage}\\b`));

    const value = JSON.parse(claim.valueJson) as {
      level: string;
      sourceLabel: string;
      requiredResolution: string;
      deepMorphologyRequired: boolean;
    };
    assert.equal(value.level, "minimum");
    assert.equal(value.sourceLabel, unit.sourceLabel);
    assert.equal(value.requiredResolution, unit.requiredResolution);
    assert.equal(value.deepMorphologyRequired, unit.deepMorphologyRequired);
  }
});

test("minimum claim registry itself passes referential and review validation", () => {
  const result = validateCatalogClaims(claims, evidence);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.claimCount, 148);
});

test("training evidence uses compact original summaries instead of copied source passages", () => {
  for (const item of evidence) {
    assert.ok(item.claimSummary.length < 320, item.evidenceId);
    assert.equal(item.evidenceStrength, "primaryExplicit");
    assert.equal(item.sourceId, "S1-obiettivi-tassonomici-v4-2026-06-09");
  }
});

test("a missing source, incompatible claim type and invalid approved chain are blocking", () => {
  const badEvidence: EvidenceRecord[] = [
    {
      evidenceId: "e-1",
      sourceId: "missing-source",
      sourceLocation: "pagina 1",
      claimType: "taxonomy",
      claimSummary: "Nome corrente documentato.",
      evidenceStrength: "primaryExplicit",
      extractedBy: "test",
      extractedAt: "2026-09-21T00:00:00Z",
      reviewedBy: null,
      reviewedAt: null,
      reviewStatus: "normalized",
      notes: null,
    },
  ];
  const evidenceValidation = validateCatalogEvidence(sources, badEvidence);
  assert.equal(evidenceValidation.ok, false);
  assert.match(evidenceValidation.errors.join("\n"), /unknown source/);

  const badClaim: CatalogClaimRecord = {
    claimId: "claim-1",
    subjectType: "taxon",
    subjectId: "taxon-1",
    fieldPath: "edibility.category",
    claimType: "edibility",
    valueJson: JSON.stringify({ category: "POISONOUS" }),
    evidenceIds: ["e-1"],
    reviewStatus: "approved",
  };
  const claimValidation = validateCatalogClaims([badClaim], [
    { ...badEvidence[0], sourceId: sources[0].sourceId },
  ]);
  assert.equal(claimValidation.ok, false);
  assert.match(claimValidation.errors.join("\n"), /incompatible claim type|below required review status|approved claim requires approved evidence/);
});

test("nomenclature reconciliation still carries evidence for all 148 source units", () => {
  assert.equal(minimumNomenclatureMappings.length, 148);
  for (const mapping of minimumNomenclatureMappings) {
    assert.ok(mapping.evidence.length > 0, mapping.sourceUnitId);
    for (const item of mapping.evidence) {
      assert.ok(item.sourceUrl.trim(), mapping.sourceUnitId);
      assert.ok(item.checkedAt.trim(), mapping.sourceUnitId);
    }
  }
});
