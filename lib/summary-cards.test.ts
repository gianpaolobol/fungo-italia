import assert from "node:assert/strict";
import test from "node:test";

import { atlasTaxa } from "./atlas-catalog.ts";
import {
  buildSummaryCardIndex,
  findSummaryCardByAtlasId,
  isSummaryCardReady,
  projectAtlasTaxonToSummaryCard,
} from "./summary-cards.ts";

test("S0 creates exactly one synthetic Scheda shell for every Atlas taxon", () => {
  const cards = buildSummaryCardIndex(atlasTaxa);
  assert.equal(cards.length, atlasTaxa.length);
  assert.equal(new Set(cards.map((card) => card.atlasId)).size, atlasTaxa.length);
});

test("S0 projection preserves Atlas scientific identity and classification", () => {
  for (const taxon of atlasTaxa) {
    const card = projectAtlasTaxonToSummaryCard(taxon);
    assert.equal(card.atlasId, taxon.id);
    assert.equal(card.atlasTarget.id, taxon.id);
    assert.equal(card.atlasTarget.rank, taxon.rank);
    assert.equal(card.commonName, taxon.commonName);
    assert.equal(card.scientificName, taxon.scientificName);
    assert.equal(card.acceptedName, taxon.acceptedName);
    assert.equal(card.rank, taxon.rank);
    assert.equal(card.classification.order, taxon.order);
    assert.equal(card.classification.family, taxon.family);
    assert.equal(card.edibility, taxon.edibility);
  }
});

test("S0 does not fabricate presentation data", () => {
  for (const card of buildSummaryCardIndex(atlasTaxa)) {
    assert.equal(card.reviewStatus, "preparing");
    assert.equal(card.presentation.primaryImageUrl, null);
    assert.deepEqual(card.presentation.detailImageUrls, []);
    assert.equal(card.presentation.habitatSummary, null);
    assert.equal(card.presentation.seasonSummary, null);
    assert.equal(card.presentation.diagnosticCharacters, null);
    assert.equal(card.presentation.differentiatingCharacter, null);
    assert.equal(card.presentation.sporePrint, "unknown");
    assert.equal(isSummaryCardReady(card), false);
  }
});

test("every Scheda shell resolves back to a valid Atlas target", () => {
  const cards = buildSummaryCardIndex(atlasTaxa);
  for (const taxon of atlasTaxa) {
    const card = findSummaryCardByAtlasId(cards, taxon.id);
    assert.ok(card, taxon.id);
    assert.equal(card.atlasTarget.id, taxon.id);
  }
});
