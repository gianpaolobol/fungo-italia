import assert from "node:assert/strict";
import test from "node:test";

import { minimumGenusCards } from "./minimum-genus-cards.ts";
import {
  genusCardHasPublicScientificLeak,
  publicGenusLayer,
} from "./public-genus-policy.ts";

const draft = minimumGenusCards.find((card) => card.reviewStatus === "reviewNeeded");
assert.ok(draft);

test("review-needed genus cards keep S1 objective visible but hide unreviewed science", () => {
  const essential = publicGenusLayer(draft, "essential");
  assert.ok(essential.objectiveSummary);
  assert.equal(essential.pendingScientificContent, true);
  assert.deepEqual(essential.bullets, []);
  assert.deepEqual(essential.taxonomyNotes, []);
  assert.deepEqual(essential.safetyFocus, []);
});

test("deepening and specialist editorial science stays hidden until reviewed", () => {
  for (const depth of ["deepening", "specialist"] as const) {
    const layer = publicGenusLayer(draft, depth);
    assert.deepEqual(layer.bullets, []);
    assert.deepEqual(layer.taxonomyNotes, []);
    assert.deepEqual(layer.safetyFocus, []);
  }
});

test("reviewed genus cards may expose descriptive content, but safety still needs approval", () => {
  const reviewed = { ...draft, reviewStatus: "reviewed" as const };
  const essential = publicGenusLayer(reviewed, "essential");
  assert.equal(essential.pendingScientificContent, false);
  assert.ok(essential.bullets.length > 0);
  assert.deepEqual(essential.safetyFocus, []);
});

test("approved genus cards may expose safety focus as well", () => {
  const approved = { ...draft, reviewStatus: "approved" as const };
  const essential = publicGenusLayer(approved, "essential");
  assert.ok(essential.bullets.length > 0);
  assert.deepEqual(essential.safetyFocus, approved.essential.safetyFocus);
});

test("current review-needed genus corpus has no public scientific leak", () => {
  for (const card of minimumGenusCards) {
    assert.equal(genusCardHasPublicScientificLeak(card), false, card.cardId);
  }
});
