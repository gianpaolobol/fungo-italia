import assert from "node:assert/strict";
import test from "node:test";

import { validateMinimumGenusCards } from "./minimum-genus-card.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import { minimumGenusSourceUnits } from "./minimum-genus-source.ts";
import { minimumCards } from "./minimum-cards.ts";

const sourceById = new Map(
  minimumGenusSourceUnits.map((entry) => [entry.id, entry]),
);
const minimumCardIds = new Set(minimumCards.map((card) => card.cardId));

test("all 66 S1 genus/group units assemble into progressive cards", () => {
  assert.equal(minimumGenusCards.length, 66);
  assert.equal(
    new Set(minimumGenusCards.map((card) => card.teachingUnitId)).size,
    66,
  );

  const validation = validateMinimumGenusCards(minimumGenusCards);
  assert.equal(validation.ok, true, validation.errors.join("\n"));
});

test("assembled cards preserve source label, rank and page exactly", () => {
  for (const card of minimumGenusCards) {
    const source = sourceById.get(card.teachingUnitId);
    assert.ok(source, card.teachingUnitId);
    assert.equal(card.sourceLabel, source.sourceLabel);
    assert.equal(card.sourceRank, source.sourceRank);
    assert.equal(card.sourcePage, source.sourcePage);
    assert.equal(card.displayTitle, source.sourceLabel);
  }
});

test("higher progressive layers follow S1 desirable and advanced availability", () => {
  for (const card of minimumGenusCards) {
    const source = sourceById.get(card.teachingUnitId);
    assert.ok(source);

    assert.equal(
      card.deepening.objectiveSummary !== null,
      source.desirableObjective !== null,
      card.sourceLabel,
    );
    assert.equal(
      card.specialist.objectiveSummary !== null,
      source.advancedObjective !== null,
      card.sourceLabel,
    );
  }
});

test("all linked minimum child cards resolve to the 148-card corpus", () => {
  for (const card of minimumGenusCards) {
    for (const childId of card.minimumChildCardIds) {
      assert.ok(
        minimumCardIds.has(childId),
        `${card.sourceLabel}: unknown child ${childId}`,
      );
    }
  }
});

test("cards never substitute current genera for the S1 teaching label", () => {
  const clitocybe = minimumGenusCards.find(
    (card) => card.sourceLabel.startsWith("Clitocybe s.l."),
  );
  assert.ok(clitocybe);
  assert.equal(clitocybe.displayTitle, clitocybe.sourceLabel);
  assert.ok(clitocybe.currentGenera.includes("Infundibulicybe"));
  assert.ok(clitocybe.currentGenera.includes("Paralepistopsis"));

  const lactarius = minimumGenusCards.find(
    (card) => card.sourceLabel === "Lactarius (incluso Lactifluus)",
  );
  assert.ok(lactarius);
  assert.equal(lactarius.displayTitle, "Lactarius (incluso Lactifluus)");
  assert.ok(lactarius.currentGenera.includes("Lactifluus"));
});

test("genus-only objectives can have zero minimum child cards without fake species", () => {
  for (const label of ["Hebeloma", "Laccaria", "Melanoleuca", "Paxillus"]) {
    const card = minimumGenusCards.find((entry) => entry.sourceLabel === label);
    assert.ok(card, label);
    assert.deepEqual(card.minimumChildCardIds, [], label);
    assert.equal(card.reviewStatus, "reviewNeeded", label);
  }
});

test("assembled essential layers contain no generic placeholders", () => {
  for (const card of minimumGenusCards) {
    assert.ok(card.essential.terminology.length > 0, card.sourceLabel);
    assert.ok(card.essential.macroCharacters.length > 0, card.sourceLabel);

    const allText = [
      card.essential.objectiveSummary,
      ...card.essential.terminology,
      ...card.essential.macroCharacters,
    ].join(" ").toLocaleLowerCase("it");

    assert.doesNotMatch(allText, /\b(todo|tbd|placeholder|da completare)\b/i);
  }
});
