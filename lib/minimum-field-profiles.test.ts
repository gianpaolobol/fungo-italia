import assert from "node:assert/strict";
import test from "node:test";

import {
  AUDITED_MINIMUM_FIELD_PROFILE_DATE,
  AUDITED_MINIMUM_FIELD_PROFILE_REVIEW_STATUS,
  AUDITED_MINIMUM_FIELD_PROFILE_TARGET,
  AUDITED_MINIMUM_FIELD_PROFILE_VERSION,
  auditedMinimumFieldProfiles,
  validateAuditedMinimumFieldProfiles,
} from "./minimum-field-profiles.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import { minimumCards } from "./minimum-cards.ts";

const labels = sourceMinimumLearningUnits.map((unit) => unit.sourceLabel);

test("scientific baseline 1.0 covers all 148 S1 minimum learning units", () => {
  const result = validateAuditedMinimumFieldProfiles(labels);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.profileCount, AUDITED_MINIMUM_FIELD_PROFILE_TARGET);
  assert.equal(AUDITED_MINIMUM_FIELD_PROFILE_TARGET, 148);
  assert.equal(AUDITED_MINIMUM_FIELD_PROFILE_VERSION, "scientific-baseline-1.0");
  assert.equal(AUDITED_MINIMUM_FIELD_PROFILE_DATE, "2026-09-28");
  assert.equal(AUDITED_MINIMUM_FIELD_PROFILE_REVIEW_STATUS, "reviewed");
});

test("every audited profile exposes exactly 3 primary field characters plus +1", () => {
  for (const label of labels) {
    const profile = auditedMinimumFieldProfiles[label];
    assert.ok(profile, label);
    assert.equal(profile.characters.length, 3, label);
    assert.ok(profile.characters.every((item) => item.trim().length > 0), label);
    assert.ok(profile.plusOne.trim().length > 0, label);
  }
});

test("base 3+1 is field-verifiable: no reagents, microscopy, DNA or taste", () => {
  const forbidden = /\bkoh\b|sch[aä]ffer|reagent|reagente|microscop|sequenzi|\bdna\b|\bassaggio\b|\bsapore\b/i;
  for (const label of labels) {
    const profile = auditedMinimumFieldProfiles[label];
    const base = [...profile.characters, profile.plusOne].join(" ");
    assert.doesNotMatch(base, forbidden, label);
  }
});

test("generic macro_limit/source_gap/pending states are absent from the audited baseline", () => {
  const serialized = JSON.stringify(auditedMinimumFieldProfiles);
  assert.doesNotMatch(serialized, /macro_limit/i);
  assert.doesNotMatch(serialized, /source_gap/i);
  assert.doesNotMatch(serialized, /\bpending\b/i);
});

test("the three release safety checks remain explicit and independent from diagnostic confidence", () => {
  const required = [
    "Kuehneromyces mutabilis",
    "Leucoagaricus leucothites s.l.",
    "Volvariella volvacea",
  ];
  for (const label of required) {
    const profile = auditedMinimumFieldProfiles[label];
    assert.ok(profile?.safetyCheck?.trim(), label);
  }
});

test("all 148 assembled minimum cards carry the audited field profile", () => {
  assert.equal(minimumCards.length, 148);
  for (const card of minimumCards) {
    const expected = auditedMinimumFieldProfiles[card.sourceLabel];
    assert.ok(expected, card.sourceLabel);
    assert.deepEqual(card.fieldProfile, expected, card.cardId);
  }
});
