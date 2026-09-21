import assert from "node:assert/strict";
import test from "node:test";

import { minimumCards } from "./minimum-cards.ts";
import {
  canPublishDescriptiveScientificContent,
  canPublishSafetyContent,
  publicConfusionWarnings,
  publicDescriptiveCardContent,
  publicEdibilityCategory,
  publicSafetySummary,
} from "./public-scientific-policy.ts";

const draft = minimumCards.find((card) => card.reviewStatus === "reviewNeeded");
assert.ok(draft);

test("descriptive content requires reviewed or approved status", () => {
  assert.equal(canPublishDescriptiveScientificContent("reviewNeeded"), false);
  assert.equal(canPublishDescriptiveScientificContent("normalized"), false);
  assert.equal(canPublishDescriptiveScientificContent("reviewed"), true);
  assert.equal(canPublishDescriptiveScientificContent("approved"), true);
});

test("safety content requires full approval", () => {
  assert.equal(canPublishSafetyContent("reviewNeeded"), false);
  assert.equal(canPublishSafetyContent("reviewed"), false);
  assert.equal(canPublishSafetyContent("approved"), true);
});

test("review-needed cards do not leak provisional edibility or confusion claims", () => {
  assert.equal(publicEdibilityCategory(draft), null);
  assert.deepEqual(publicConfusionWarnings(draft), []);
  assert.match(publicSafetySummary(draft), /in attesa di approvazione micologica/i);
});

test("review-needed morphology and ecology are excluded from public projection", () => {
  const projected = publicDescriptiveCardContent(draft);
  assert.equal(projected.pending, true);
  assert.deepEqual(projected.terminology, []);
  assert.deepEqual(projected.essentialMorphology, []);
  assert.equal(projected.ecologySummary, null);
});

test("approved card projection restores reviewed scientific content", () => {
  const approved = { ...draft, reviewStatus: "approved" as const };
  assert.equal(publicEdibilityCategory(approved), approved.edibilityCategory);
  assert.deepEqual(publicConfusionWarnings(approved), approved.confusionWarnings);
  assert.equal(publicSafetySummary(approved), approved.safetySummary);
  const projected = publicDescriptiveCardContent(approved);
  assert.equal(projected.pending, false);
  assert.deepEqual(projected.terminology, approved.terminology);
  assert.deepEqual(projected.essentialMorphology, approved.essentialMorphology);
  assert.equal(projected.ecologySummary, approved.ecologySummary);
});
