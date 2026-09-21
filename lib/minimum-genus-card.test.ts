import assert from "node:assert/strict";
import test from "node:test";

import {
  validateMinimumGenusCards,
  type MinimumGenusCard,
} from "./minimum-genus-card.ts";

function card(overrides: Partial<MinimumGenusCard> = {}): MinimumGenusCard {
  return {
    cardId: "genus-card-agaricus",
    teachingUnitId: "genus-source-agaricus",
    sourceLabel: "Agaricus",
    sourceRank: "genus",
    sourcePage: 4,
    displayTitle: "Agaricus",
    sourceGenera: ["Agaricus"],
    currentGenera: ["Agaricus"],
    minimumChildCardIds: [
      "minimum-card-objective-agaricus--01--agaricus-sez-xanthodermatei",
    ],
    essential: {
      objectiveSummary: "Riconoscere il genere e i nuclei minimi previsti da S1.",
      terminology: ["Lamelle libere", "Anello", "Sporata bruno-cioccolata"],
      macroCharacters: [
        "Lamelle da rosate a bruno scuro con la maturazione.",
        "Volva assente; anello generalmente presente.",
      ],
      safetyFocus: ["Separare con attenzione le specie ingiallenti del gruppo Xanthodermatei."],
      claimIds: ["claim-genus-essential-agaricus"],
    },
    deepening: {
      objectiveSummary: "Approfondire specie e sezioni comuni.",
      discriminatingCharacters: ["Odore", "Ingiallimento", "Arrossamento"],
      taxonomyNotes: ["Le sezioni storiche restano visibili come concetti didattici."],
      claimIds: ["claim-genus-deepening-agaricus"],
    },
    specialist: {
      objectiveSummary: "Determinare specie ulteriori nelle sezioni studiate.",
      specialistTopics: ["Microscopia", "Variabilità intraspecifica"],
      claimIds: ["claim-genus-specialist-agaricus"],
    },
    reviewStatus: "reviewNeeded",
    ...overrides,
  };
}

test("a complete progressive genus/group card passes the contract", () => {
  const result = validateMinimumGenusCards([card()], { expectedCount: 1 });
  assert.equal(result.ok, true, result.errors.join("\n"));
});

test("essential layer is mandatory and rejects placeholders", () => {
  const result = validateMinimumGenusCards([
    card({
      essential: {
        objectiveSummary: "TODO",
        terminology: [],
        macroCharacters: ["da completare"],
        safetyFocus: [],
        claimIds: [],
      },
    }),
  ], { expectedCount: 1 });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /essential objective summary is required/);
  assert.match(result.errors.join("\n"), /essential terminology is empty/);
  assert.match(result.errors.join("\n"), /essential macro characters contains placeholder/);
  assert.match(result.errors.join("\n"), /essential layer requires claim ids/);
});

test("deepening and specialist layers are optional only when S1 has no objective for them", () => {
  const noHigherLayers = card({
    deepening: {
      objectiveSummary: null,
      discriminatingCharacters: [],
      taxonomyNotes: [],
      claimIds: [],
    },
    specialist: {
      objectiveSummary: null,
      specialistTopics: [],
      claimIds: [],
    },
  });
  assert.equal(
    validateMinimumGenusCards([noHigherLayers], { expectedCount: 1 }).ok,
    true,
  );

  const missingEvidence = card({
    deepening: {
      objectiveSummary: "Riconoscere specie ulteriori.",
      discriminatingCharacters: [],
      taxonomyNotes: [],
      claimIds: [],
    },
  });
  const result = validateMinimumGenusCards([missingEvidence], { expectedCount: 1 });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /deepening layer requires claim ids/);
});

test("teaching cards keep source and current genera as separate vocabularies", () => {
  const result = validateMinimumGenusCards([
    card({
      sourceLabel: "Clitocybe s.l.",
      sourceRank: "operationalGroup",
      displayTitle: "Clitocybe s.l.",
      sourceGenera: ["Clitocybe"],
      currentGenera: ["Clitocybe", "Collybia", "Infundibulicybe", "Paralepistopsis"],
    }),
  ], { expectedCount: 1 });
  assert.equal(result.ok, true, result.errors.join("\n"));
});

test("minimum child cards are linked by id and cannot be duplicated", () => {
  const result = validateMinimumGenusCards([
    card({
      minimumChildCardIds: ["minimum-card-a", "minimum-card-a"],
    }),
  ], { expectedCount: 1 });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /duplicate minimum child card id/);
});

test("release cardinality for the teaching layer is explicitly 66", () => {
  const result = validateMinimumGenusCards([], { requireEvidenceLinks: false });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /card count 0; expected 66/);
});
