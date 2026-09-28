import assert from "node:assert/strict";
import test from "node:test";

import claimsJson from "../data/catalog/claims.json" with { type: "json" };
import evidenceJson from "../data/catalog/evidence.json" with { type: "json" };
import sourcesJson from "../data/catalog/sources.json" with { type: "json" };

import {
  validateCatalogClaims,
  validateCatalogEvidence,
  type CatalogClaimRecord,
  type CatalogSourceRecord,
  type EvidenceRecord,
} from "./catalog-evidence.ts";
import {
  minimumCardDraftClaims,
  minimumCardDraftEvidence,
} from "./minimum-card-editorial.ts";
import { minimumCards } from "./minimum-cards.ts";
import { validateMinimumCards, type MinimumAtlasCard } from "./minimum-card.ts";

function card(overrides: Partial<MinimumAtlasCard> = {}): MinimumAtlasCard {
  return {
    cardId: "card-1",
    learningUnitId: "unit-1",
    depth: "minimum",
    displayName: "Amanita phalloides",
    sourceLabel: "Amanita phalloides",
    rank: "species",
    currentAcceptedNames: ["Amanita phalloides"],
    terminology: ["Basidioma con cappello, gambo, anello e volva"],
    essentialMorphology: [
      "Lamelle bianche e libere",
      "Volva membranosa alla base del gambo",
    ],
    fieldProfile: {
      characters: [
        "Lamelle bianche e libere.",
        "Volva membranosa e sacciforme alla base.",
        "Anello membranoso sul gambo.",
      ],
      plusOne: "Cappello spesso olivastro con fibrille radiali.",
      diagnosticStatus: "field_high_confidence",
    },
    ecologySummary: "Specie ectomicorrizica di boschi di latifoglie e misti.",
    confusionWarnings: [],
    edibilityCategory: "POISONOUS",
    treatmentCodes: [],
    safetySummary: "Specie velenosa potenzialmente mortale; nessun uso alimentare.",
    claimIds: ["claim-1"],
    reviewStatus: "normalized",
    ...overrides,
  };
}

test("a complete progressive minimum card passes the card contract", () => {
  const result = validateMinimumCards([card()], { expectedCount: 1 });
  assert.equal(result.ok, true, result.errors.join("\n"));
});

test("minimum cards reject placeholders and missing progressive content", () => {
  const result = validateMinimumCards([
    card({
      terminology: ["TODO"],
      essentialMorphology: [],
      ecologySummary: null,
      safetySummary: "da completare",
      claimIds: [],
    }),
  ], { expectedCount: 1 });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /terminology is incomplete/);
  assert.match(result.errors.join("\n"), /essential morphology is incomplete/);
  assert.match(result.errors.join("\n"), /ecology summary is incomplete/);
  assert.match(result.errors.join("\n"), /safety summary is incomplete/);
  assert.match(result.errors.join("\n"), /no claims linked/);
});

test("conditional edibility always declares treatments", () => {
  const result = validateMinimumCards([
    card({
      edibilityCategory: "EDIBLE_AFTER_TREATMENT",
      treatmentCodes: [],
    }),
  ], { expectedCount: 1 });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /requires treatment codes/);
});

test("deadly confusions require explicit discriminating characters and claim provenance", () => {
  const result = validateMinimumCards([
    card({
      confusionWarnings: [{
        with: "Amanita caesarea",
        context: "Ovoli chiusi possono essere scambiati.",
        discriminatingCharacters: ["Colore interno dell'ovolo"],
        risk: "deadly",
        claimIds: [],
      }],
    }),
  ], { expectedCount: 1 });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /confusion requires claim ids/);
  assert.match(result.errors.join("\n"), /at least two discriminating characters/);
});

test("the release gate keeps the 148-card cardinality explicit", () => {
  const result = validateMinimumCards([], { requireCompleteContent: false });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /card count 0; expected 148/);
});


test("all 148 minimum cards pass the progressive content gate", () => {
  const result = validateMinimumCards(minimumCards);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.cardCount, 148);
});

test("all minimum-card draft evidence and claims pass provenance validation", () => {
  const sources = sourcesJson as CatalogSourceRecord[];
  const baseEvidence = evidenceJson as EvidenceRecord[];
  const baseClaims = claimsJson as CatalogClaimRecord[];
  const allEvidence = [...baseEvidence, ...minimumCardDraftEvidence];
  const allClaims = [...baseClaims, ...minimumCardDraftClaims];

  const evidenceResult = validateCatalogEvidence(sources, allEvidence);
  assert.equal(evidenceResult.ok, true, evidenceResult.errors.join("\n"));

  const claimResult = validateCatalogClaims(allClaims, allEvidence);
  assert.equal(claimResult.ok, true, claimResult.errors.join("\n"));
});

test("every card claim id resolves to the canonical or draft claim registry", () => {
  const baseClaims = claimsJson as CatalogClaimRecord[];
  const ids = new Set(
    [...baseClaims, ...minimumCardDraftClaims].map((claim) => claim.claimId),
  );

  for (const card of minimumCards) {
    assert.ok(card.claimIds.length >= 4, card.cardId);
    for (const claimId of card.claimIds) {
      assert.ok(ids.has(claimId), `${card.cardId}: missing claim ${claimId}`);
    }
    for (const confusion of card.confusionWarnings) {
      for (const claimId of confusion.claimIds) {
        assert.ok(ids.has(claimId), `${card.cardId}: missing confusion claim ${claimId}`);
      }
    }
  }
});

test("draft cards are explicitly review-needed rather than silently approved", () => {
  assert.equal(
    minimumCards.every((card) => card.reviewStatus === "reviewNeeded"),
    true,
  );
  assert.equal(
    minimumCardDraftEvidence.every((item) => item.reviewStatus === "reviewNeeded"),
    true,
  );
  assert.equal(
    minimumCardDraftClaims.every((claim) => claim.reviewStatus === "reviewNeeded"),
    true,
  );
});

test("dangerous confusion drafts retain at least two discriminating characters", () => {
  const dangerous = minimumCards.flatMap((card) =>
    card.confusionWarnings
      .filter((confusion) => confusion.risk === "deadly")
      .map((confusion) => ({ card, confusion })),
  );
  assert.ok(dangerous.length > 0);
  for (const { card, confusion } of dangerous) {
    assert.ok(confusion.discriminatingCharacters.length >= 2, card.cardId);
  }
});

test("provisional edibility remains visibly non-approved while preserving treatment requirements", () => {
  const conditional = minimumCards.filter(
    (card) => card.edibilityCategory === "EDIBLE_AFTER_TREATMENT",
  );
  assert.ok(conditional.length > 0);
  for (const card of conditional) {
    assert.ok(card.treatmentCodes.length > 0, card.cardId);
    assert.match(card.safetySummary, /provvisorio/i);
    assert.match(card.safetySummary, /non costituisce autorizzazione al consumo/i);
  }
});
