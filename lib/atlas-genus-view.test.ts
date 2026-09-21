import assert from "node:assert/strict";
import test from "node:test";

import { minimumGenusCards } from "./minimum-genus-cards.ts";
import {
  availableGenusDepths,
  findGenusCardViewModel,
  genusCardViewModel,
} from "./atlas-genus-view.ts";

function cardByLabel(label: string) {
  const found = minimumGenusCards.find((card) => card.sourceLabel === label);
  assert.ok(found, `missing genus card: ${label}`);
  return found;
}

test("essential genus view exposes only essential learning material plus child links", () => {
  const card = cardByLabel("Amanita");
  const view = genusCardViewModel(card, "essential");

  assert.equal(view.sectionTitle, "Essenziale");
  assert.equal(view.objectiveSummary, card.essential.objectiveSummary);
  assert.deepEqual(
    view.bullets,
    [...card.essential.terminology, ...card.essential.macroCharacters],
  );
  assert.deepEqual(view.taxonomyNotes, []);
  assert.deepEqual(view.safetyFocus, card.essential.safetyFocus);
  assert.deepEqual(view.minimumChildCardIds, card.minimumChildCardIds);
  assert.deepEqual(view.claimIds, card.essential.claimIds);
});

test("deepening genus view switches content without losing identity or child navigation", () => {
  const card = cardByLabel("Amanita");
  const view = genusCardViewModel(card, "deepening");

  assert.equal(view.sectionTitle, "Approfondimento");
  assert.equal(view.cardId, card.cardId);
  assert.equal(view.teachingUnitId, card.teachingUnitId);
  assert.deepEqual(view.minimumChildCardIds, card.minimumChildCardIds);
  assert.deepEqual(view.bullets, card.deepening.discriminatingCharacters);
  assert.deepEqual(view.taxonomyNotes, card.deepening.taxonomyNotes);
  assert.deepEqual(view.claimIds, card.deepening.claimIds);
});

test("specialist genus view remains separate from essential and deepening content", () => {
  const card = cardByLabel("Amanita");
  const view = genusCardViewModel(card, "specialist");

  assert.equal(view.sectionTitle, "Specialistico");
  assert.deepEqual(view.bullets, card.specialist.specialistTopics);
  assert.deepEqual(view.taxonomyNotes, []);
  assert.deepEqual(view.safetyFocus, []);
  assert.deepEqual(view.claimIds, card.specialist.claimIds);
});

test("available depth controls follow the source objectives", () => {
  const agaricus = cardByLabel("Agaricus");
  const depths = availableGenusDepths(agaricus);
  assert.ok(depths.includes("essential"));

  if (agaricus.deepening.objectiveSummary !== null) {
    assert.ok(depths.includes("deepening"));
  }
  if (agaricus.specialist.objectiveSummary !== null) {
    assert.ok(depths.includes("specialist"));
  }

  const withoutOptional = minimumGenusCards.find(
    (card) =>
      card.deepening.objectiveSummary === null ||
      card.specialist.objectiveSummary === null,
  );
  assert.ok(withoutOptional);
  const optionalDepths = availableGenusDepths(withoutOptional);
  if (withoutOptional.deepening.objectiveSummary === null) {
    assert.equal(optionalDepths.includes("deepening"), false);
  }
  if (withoutOptional.specialist.objectiveSummary === null) {
    assert.equal(optionalDepths.includes("specialist"), false);
  }
});

test("card lookup resolves a URL-selected teaching group and rejects unknown ids", () => {
  const card = cardByLabel("Clitocybe s.l. (inclusi Ampulloclitocybe, Atractosporocybe, Bonomyces, Clitopaxillus, Harmajaea, Hygrophorocybe, Infundibulicybe, Leucocybe p.p., Musumecia, Paralepistopsis, Pseudoclitocybe, Rhizocybe, Singerocybe, Spodocybe)");
  const view = findGenusCardViewModel(card.cardId, "essential");
  assert.ok(view);
  assert.equal(view.cardId, card.cardId);
  assert.equal(view.sourceLabel, card.sourceLabel);

  assert.equal(findGenusCardViewModel("missing-card", "essential"), null);
});
