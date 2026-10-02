import assert from "node:assert/strict";
import test from "node:test";

import sourcesJson from "../data/catalog/sources.json" with { type: "json" };
import {
  validateCatalogClaims,
  validateCatalogEvidence,
  type CatalogSourceRecord,
} from "./catalog-evidence.ts";
import { validateMinimumGenusCards } from "./minimum-genus-card.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import {
  minimumGenusCardClaims,
  minimumGenusCardEvidence,
} from "./minimum-genus-editorial.ts";
import { minimumGenusTeachingMaps } from "./minimum-genus-map.ts";
import { minimumGenusSourceUnits } from "./minimum-genus-source.ts";
import { minimumCards } from "./minimum-cards.ts";

const sources = sourcesJson as CatalogSourceRecord[];

test("Lotto 6 genus/group corpus passes the complete structural and provenance gate", () => {
  assert.equal(minimumGenusSourceUnits.length, 66);
  assert.equal(minimumGenusTeachingMaps.length, 66);
  assert.equal(minimumGenusCards.length, 66);

  const cards = validateMinimumGenusCards(minimumGenusCards);
  assert.equal(cards.ok, true, cards.errors.join("\n"));

  const evidence = validateCatalogEvidence(sources, minimumGenusCardEvidence);
  assert.equal(evidence.ok, true, evidence.errors.join("\n"));

  const claims = validateCatalogClaims(
    minimumGenusCardClaims,
    minimumGenusCardEvidence,
  );
  assert.equal(claims.ok, true, claims.errors.join("\n"));
});

test("every teaching map has exactly one source unit and one assembled card", () => {
  const sourceIds = new Set(minimumGenusSourceUnits.map((entry) => entry.id));
  const mapIds = new Set(minimumGenusTeachingMaps.map((entry) => entry.teachingUnitId));
  const cardIds = new Set(minimumGenusCards.map((entry) => entry.teachingUnitId));

  assert.deepEqual(mapIds, sourceIds);
  assert.deepEqual(cardIds, sourceIds);
});

test("minimum child links are lossless for all child units belonging to the 66 teaching headings", () => {
  const expected = new Set(
    minimumGenusTeachingMaps.flatMap((entry) => entry.childLearningUnitIds),
  );
  const actual = new Set(
    minimumGenusCards.flatMap((entry) => entry.minimumChildCardIds),
  );

  const cardIdByLearningUnit = new Map(
    minimumCards.map((card) => [card.learningUnitId, card.cardId]),
  );
  const expectedCardIds = new Set(
    [...expected].map((learningUnitId) => {
      const cardId = cardIdByLearningUnit.get(learningUnitId);
      assert.ok(cardId, learningUnitId);
      return cardId;
    }),
  );

  assert.deepEqual(actual, expectedCardIds);
});

test("a minimum child card cannot silently belong to multiple teaching units", () => {
  const owners = new Map<string, string[]>();
  for (const card of minimumGenusCards) {
    for (const childId of card.minimumChildCardIds) {
      const list = owners.get(childId) ?? [];
      list.push(card.teachingUnitId);
      owners.set(childId, list);
    }
  }

  for (const [childId, teachingUnits] of owners) {
    assert.equal(
      teachingUnits.length,
      1,
      `${childId} belongs to ${teachingUnits.join(", ")}`,
    );
  }
});

test("every claim linked from the 66 cards exists exactly once", () => {
  const counts = new Map<string, number>();
  for (const claim of minimumGenusCardClaims) {
    counts.set(claim.claimId, (counts.get(claim.claimId) ?? 0) + 1);
  }

  for (const card of minimumGenusCards) {
    for (const claimId of [
      ...card.essential.claimIds,
      ...card.deepening.claimIds,
      ...card.specialist.claimIds,
    ]) {
      assert.equal(counts.get(claimId), 1, `${card.sourceLabel}: ${claimId}`);
    }
  }
});

test("scientific review remains open: no editorial genus-card content is pre-approved", () => {
  const editorialEvidence = minimumGenusCardEvidence.filter(
    (entry) => entry.sourceId === "EDITORIAL-minimum-card-synthesis-v1",
  );
  assert.ok(editorialEvidence.length > 0);
  assert.equal(
    editorialEvidence.some((entry) => entry.reviewStatus === "approved"),
    false,
  );

  assert.equal(
    minimumGenusCards.every((card) => card.reviewStatus === "reviewNeeded"),
    true,
  );
});

test("the old 67-card planning number is not used as a release invariant", () => {
  assert.equal(minimumGenusCards.length, 66);
  assert.notEqual(minimumGenusCards.length, 67);
});
