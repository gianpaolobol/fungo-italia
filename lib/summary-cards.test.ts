import assert from "node:assert/strict";
import test from "node:test";

import { atlasTaxa } from "./atlas-catalog.ts";
import { reviewedSummaryCardContent } from "./summary-card-content.ts";
import {
  buildSummaryCardIndex,
  findSummaryCardByAtlasId,
  isSummaryCardContentReady,
  isSummaryCardReady,
  projectAtlasTaxonToSummaryCard,
} from "./summary-cards.ts";

const imageCompleteIds = new Set([
  "atlas-cantharellus-cibarius",
  "atlas-lactarius-deliciosus",
  "atlas-amanita-caesarea",
  "atlas-calocybe-gambosa",
  "atlas-pleurotus-eryngii",
  "atlas-auricularia-auricula-judae",
  "atlas-clitocybe-geotropa",
  "atlas-coprinus-comatus",
  "atlas-marasmius-oreades",
  "atlas-pleurotus-ostreatus",
  "atlas-imleria-badia",
  "atlas-craterellus-lutescens",
  "atlas-craterellus-tubaeformis",
  "atlas-lyophyllum-decastes",
  "atlas-tricholoma-columbetta",
]);

const reviewedIds = new Set(Object.keys(reviewedSummaryCardContent));

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
    assert.equal(card.displayCommonName, taxon.commonName);
    assert.equal(card.scientificName, taxon.scientificName);
    assert.equal(card.acceptedName, taxon.acceptedName);
    assert.equal(card.rank, taxon.rank);
    assert.equal(card.classification.order, taxon.order);
    assert.equal(card.classification.family, taxon.family);
    assert.equal(card.edibility, taxon.edibility);
  }
});

test("bare S0 projection never fabricates presentation data", () => {
  for (const taxon of atlasTaxa) {
    const card = projectAtlasTaxonToSummaryCard(taxon);
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

test("reviewed Schede are exposed without hard-coded count drift", () => {
  const cards = buildSummaryCardIndex(atlasTaxa);
  const scienceReady = cards.filter(isSummaryCardContentReady);
  assert.equal(scienceReady.length, reviewedIds.size);
  assert.deepEqual(new Set(scienceReady.map((card) => card.atlasId)), reviewedIds);

  for (const card of scienceReady) {
    assert.equal(card.reviewStatus, "ready");
    assert.ok(card.presentation.habitatSummary?.trim());
    assert.ok(card.presentation.seasonSummary?.trim());
    assert.equal(card.presentation.diagnosticCharacters?.length, 3);
    assert.ok(card.presentation.diagnosticCharacters?.every((item) => item.trim().length > 0));
    assert.ok(card.presentation.differentiatingCharacter?.trim());
    assert.notEqual(card.presentation.sporePrint, "unknown");
  }
});

test("image-complete S1 Schede retain a repository image asset", () => {
  const cards = buildSummaryCardIndex(atlasTaxa);
  const complete = cards.filter(isSummaryCardReady);
  assert.deepEqual(new Set(complete.map((card) => card.atlasId)), imageCompleteIds);
  for (const card of complete) {
    assert.match(card.presentation.primaryImageUrl ?? "", /^\/schede\/s1\/.+\.webp$/);
  }
});

test("presentation overlays never override Atlas scientific identity, rank or edibility", () => {
  const cards = buildSummaryCardIndex(atlasTaxa);
  const atlasById = new Map(atlasTaxa.map((taxon) => [taxon.id, taxon]));

  for (const card of cards.filter(isSummaryCardContentReady)) {
    const taxon = atlasById.get(card.atlasId);
    assert.ok(taxon, card.atlasId);
    assert.equal(card.scientificName, taxon.scientificName);
    assert.equal(card.acceptedName, taxon.acceptedName);
    assert.equal(card.rank, taxon.rank);
    assert.equal(card.edibility, taxon.edibility);
    assert.equal(card.atlasTarget.id, taxon.id);
  }
});
