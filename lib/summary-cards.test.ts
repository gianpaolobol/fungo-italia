import assert from "node:assert/strict";
import test from "node:test";

import { atlasTaxa } from "./atlas-catalog.ts";
import { minimumCards } from "./minimum-cards.ts";
import { autoSummaryForAtlasTaxon } from "./summary-card-auto.ts";
import { reviewedSummaryCardContent } from "./summary-card-content.ts";
import {
  buildSummaryCardIndex,
  findSummaryCardByAtlasId,
  isSummaryCardContentReady,
  isSummaryCardReady,
  projectAtlasTaxonToSummaryCard,
  summaryCardScientificReviewNote,
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
const expectedImageCompleteCount = Object.values(reviewedSummaryCardContent).filter((entry) => Boolean(entry.presentation.primaryImageUrl)).length;

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

test("every Atlas taxon receives a populated Scheda study shell", () => {
  const cards = buildSummaryCardIndex(atlasTaxa);
  assert.equal(cards.length, atlasTaxa.length);

  for (const card of cards) {
    assert.ok(card.presentation.habitatSummary?.trim(), card.atlasId);
    assert.ok(card.presentation.seasonSummary?.trim(), card.atlasId);
    assert.equal(card.presentation.diagnosticCharacters?.length, 3, card.atlasId);
    assert.ok(card.presentation.diagnosticCharacters?.every((item) => item.trim().length > 0), card.atlasId);
    assert.notEqual(card.basis, "atlas-only", card.atlasId);
  }
});

test("reviewed Schede are exposed without hard-coded count drift", () => {
  const cards = buildSummaryCardIndex(atlasTaxa);
  const reviewed = cards.filter((card) => card.basis === "reviewed-taxon");
  assert.equal(reviewed.length, reviewedIds.size);

  for (const card of reviewed) {
    assert.equal(card.reviewStatus, "ready");
    assert.ok(card.presentation.differentiatingCharacter?.trim());
    assert.notEqual(card.presentation.sporePrint, "unknown");
  }
});

test("image-complete S1 Schede retain a repository image asset", () => {
  const cards = buildSummaryCardIndex(atlasTaxa);
  const complete = cards.filter(isSummaryCardReady);
  assert.equal(complete.length, expectedImageCompleteCount);
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

test("genus context does not assign a species-specific spore print or season", () => {
  const taxon = { ...atlasTaxa[0], scientificName: "Russula auditfixture", parentScientificName: "Russula", rank: "species" as const };
  const automatic = autoSummaryForAtlasTaxon(taxon);
  assert.equal(automatic.basis, "genus-context");
  assert.equal(automatic.presentation.sporePrint, "unknown");
  assert.match(automatic.presentation.habitatSummary ?? "", /non verificato per questa voce/);
  assert.match(automatic.presentation.seasonSummary ?? "", /non ancora verificata/);
});
test("audited field profile does not reopen provisional ecology or terminology", () => {
  const draft = minimumCards.find((card) => card.rank === "species" && card.currentAcceptedNames.length === 1 && card.reviewStatus === "reviewNeeded");
  assert.ok(draft);
  const automatic = autoSummaryForAtlasTaxon({ ...atlasTaxa[0], scientificName: draft.currentAcceptedNames[0], rank: "species" });
  assert.equal(automatic.basis, "minimum-baseline");
  assert.deepEqual(automatic.presentation.diagnosticCharacters, draft.fieldProfile.characters);
  assert.equal(automatic.presentation.differentiatingCharacter, draft.fieldProfile.plusOne);
  assert.equal(automatic.presentation.sporePrint, "unknown");
  assert.match(automatic.presentation.habitatSummary ?? "", /in attesa di revisione/);
});
test("a group profile is not silently transferred to an individual species", () => {
  const group = minimumCards.find((card) => card.rank !== "species");
  assert.ok(group);
  const automatic = autoSummaryForAtlasTaxon({ ...atlasTaxa[0], scientificName: group.sourceLabel, rank: "species" });
  assert.equal(automatic.basis, "genus-context");
  assert.equal(automatic.presentation.differentiatingCharacter, null);
});
test("editorial completeness does not attest independent scientific approval", () => {
  const base = projectAtlasTaxonToSummaryCard(atlasTaxa[0]);
  assert.match(summaryCardScientificReviewNote({ ...base, reviewStatus: "ready", basis: "reviewed-taxon" }), /non attesta.*revisione micologica indipendente/);
  assert.match(summaryCardScientificReviewNote({ ...base, basis: "minimum-baseline" }), /audit interno/);
  assert.match(summaryCardScientificReviewNote({ ...base, basis: "genus-context" }), /non sono una diagnosi verificata/);
});
test("canonical study card id preserves group identity and audited 3+1", () => {
  const group = minimumCards.find((card) => card.rank !== "species");
  assert.ok(group);
  const automatic = autoSummaryForAtlasTaxon({ ...atlasTaxa[0], id: group.cardId, scientificName: group.displayName, rank: group.rank });
  assert.equal(automatic.basis, "minimum-baseline");
  assert.deepEqual(automatic.presentation.diagnosticCharacters, group.fieldProfile.characters);
  assert.equal(automatic.presentation.differentiatingCharacter, group.fieldProfile.plusOne);
});
test("all canonical minimum ids preserve their own baseline instead of legacy overlays", () => {
  const canonicalTaxa = minimumCards.map((card) => ({ ...atlasTaxa[0], id: card.cardId, scientificName: card.displayName, rank: card.rank }));
  const cards = buildSummaryCardIndex(canonicalTaxa);
  for (let index = 0; index < cards.length; index++) {
    assert.equal(cards[index].basis, "minimum-baseline", minimumCards[index].cardId);
    assert.deepEqual(cards[index].presentation.diagnosticCharacters, minimumCards[index].fieldProfile.characters);
  }
});
