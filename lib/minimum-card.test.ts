import assert from "node:assert/strict";
import test from "node:test";

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
