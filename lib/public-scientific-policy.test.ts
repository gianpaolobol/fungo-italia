import assert from "node:assert/strict";
import test from "node:test";

import { minimumCards } from "./minimum-cards.ts";
import {
  canPublishDescriptiveScientificContent,
  canPublishSafetyContent,
  publicAuditedFieldProfile,
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


test("audited 3+1 field profile is public even while provisional safety remains gated", () => {
  const profile = publicAuditedFieldProfile(draft);
  assert.equal(profile.characters.length, 3);
  assert.ok(profile.plusOne.length > 0);
  assert.equal(profile.reviewStatus, "reviewed");
  assert.equal(profile.version, "scientific-baseline-1.0");
  assert.equal(profile.auditedAt, "2026-09-28");
  assert.equal(publicEdibilityCategory(draft), null);
});
