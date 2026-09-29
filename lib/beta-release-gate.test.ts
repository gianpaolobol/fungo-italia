import assert from "node:assert/strict";
import test from "node:test";

import attestations from "../data/catalog/release-attestations.json" with { type: "json" };
import { evaluateBetaReleaseGate } from "./beta-release-gate.ts";

test("current private beta gate is ready while scientific completion remains open", () => {
  const gate = evaluateBetaReleaseGate();
  assert.equal(gate.ready, true, gate.blockers.join("\n"));
  assert.equal(gate.scientificReady, false);
  assert.equal(gate.checks.minimumCards, 148);
  assert.equal(gate.checks.genusCards, 66);
  assert.equal(gate.checks.searchDocuments, 214);
  assert.equal(gate.checks.nomenclatureConflicts, 0);
  assert.equal(gate.checks.nomenclatureUnresolved, 0);
  assert.ok(gate.checks.reviewNeededClaims > 0);
  assert.equal(gate.checks.auditedFieldProfiles, 148);
  assert.equal(gate.checks.auditedFieldProfileErrors, 0);
  assert.equal(gate.checks.auditedFieldProfileClaims, 148);
  assert.equal(gate.checks.auditedFieldProfileEvidence, 148);
  assert.equal(gate.checks.auditedFieldSafetyChecks, 3);
  assert.equal(gate.checks.minimumPublicScientificLeaks, 0);
  assert.equal(gate.checks.genusPublicScientificLeaks, 0);
  assert.equal(gate.checks.visualViewportSmoke, "verified");
  assert.equal(
    gate.blockers.some((item) => item.includes("Scientific review queue")),
    false,
  );
  assert.match(gate.scientificBlockers.join("\n"), /Scientific review queue is not empty/);
  assert.match(gate.scientificBlockers.join("\n"), /Independent mycological review has not been verified/);
});

test("pending visual smoke still blocks the private beta", () => {
  const pending = {
    ...attestations,
    visualViewportSmoke: {
      ...attestations.visualViewportSmoke,
      status: "pending" as const,
      verifiedBy: null,
      verifiedAt: null,
      commitSha: null,
    },
  };
  const gate = evaluateBetaReleaseGate(pending);
  assert.equal(gate.ready, false);
  assert.match(gate.blockers.join("\n"), /visual viewport smoke test has not been verified/i);
});

test("scientific completion cannot be inferred from private-beta readiness", () => {
  const pretendIndependentReview = {
    ...attestations,
    independentMycologicalReview: {
      ...attestations.independentMycologicalReview,
      status: "verified" as const,
      verifiedBy: "reviewer",
      verifiedAt: "2026-09-22T00:00:00Z",
    },
  };
  const gate = evaluateBetaReleaseGate(pretendIndependentReview);
  assert.equal(gate.ready, true, gate.blockers.join("\n"));
  assert.equal(gate.scientificReady, false);
  assert.equal(
    gate.scientificBlockers.some((item) => item.includes("Scientific review queue")),
    true,
  );
});
