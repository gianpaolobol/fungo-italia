import assert from "node:assert/strict";
import test from "node:test";

import sourcesJson from "../data/catalog/sources.json" with { type: "json" };
import {
  validateCatalogClaims,
  validateCatalogEvidence,
  type CatalogSourceRecord,
} from "./catalog-evidence.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import {
  minimumGenusCardClaims,
  minimumGenusCardEvidence,
} from "./minimum-genus-editorial.ts";
import { minimumGenusSourceUnits } from "./minimum-genus-source.ts";

const sources = sourcesJson as CatalogSourceRecord[];

test("genus-card evidence resolves only to registered catalog sources", () => {
  const result = validateCatalogEvidence(sources, minimumGenusCardEvidence);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.ok(result.evidenceCount > 66);
});

test("all progressive genus-card claims pass provenance validation", () => {
  const result = validateCatalogClaims(
    minimumGenusCardClaims,
    minimumGenusCardEvidence,
  );
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.ok(result.claimCount > 66);
});

test("every claim id linked by a genus card resolves to an actual claim", () => {
  const claimIds = new Set(minimumGenusCardClaims.map((claim) => claim.claimId));

  for (const card of minimumGenusCards) {
    const linked = [
      ...card.essential.claimIds,
      ...card.deepening.claimIds,
      ...card.specialist.claimIds,
    ];
    assert.ok(linked.length >= 3, card.sourceLabel);
    for (const claimId of linked) {
      assert.ok(claimIds.has(claimId), `${card.sourceLabel}: ${claimId}`);
    }
  }
});

test("S1 training evidence exists for every progressive level present in the source", () => {
  const evidenceIds = new Set(
    minimumGenusCardEvidence.map((item) => item.evidenceId),
  );

  for (const source of minimumGenusSourceUnits) {
    assert.ok(
      evidenceIds.has(`evidence-genus-training-minimum-${source.id}`),
      source.sourceLabel,
    );
    if (source.desirableObjective !== null) {
      assert.ok(
        evidenceIds.has(`evidence-genus-training-desirable-${source.id}`),
        source.sourceLabel,
      );
    }
    if (source.advancedObjective !== null) {
      assert.ok(
        evidenceIds.has(`evidence-genus-training-advanced-${source.id}`),
        source.sourceLabel,
      );
    }
  }
});

test("editorial morphology content remains reviewNeeded instead of being silently approved", () => {
  const editorialEvidence = minimumGenusCardEvidence.filter(
    (item) => item.sourceId === "EDITORIAL-minimum-card-synthesis-v1",
  );
  assert.ok(editorialEvidence.length > 0);
  assert.equal(
    editorialEvidence.every((item) => item.reviewStatus === "reviewNeeded"),
    true,
  );

  const morphologyClaims = minimumGenusCardClaims.filter(
    (claim) => claim.claimType === "morphology",
  );
  assert.ok(morphologyClaims.length > 0);
  assert.equal(
    morphologyClaims.every((claim) => claim.reviewStatus === "reviewNeeded"),
    true,
  );
});

test("source-only genus units do not receive a fabricated normalized current-genus assertion", () => {
  const taxonomyClaims = new Map(
    minimumGenusCardClaims
      .filter((claim) => claim.claimType === "taxonomy")
      .map((claim) => [claim.subjectId, claim]),
  );

  for (const card of minimumGenusCards.filter((entry) => entry.currentGenera.length === 0)) {
    const claim = taxonomyClaims.get(card.teachingUnitId);
    assert.ok(claim, card.sourceLabel);
    assert.equal(claim.reviewStatus, "reviewNeeded", card.sourceLabel);
  }
});
