import assert from "node:assert/strict";
import test from "node:test";

import attestations from "../data/catalog/release-attestations.json" with { type: "json" };
import { evaluateBetaReleaseGate } from "./beta-release-gate.ts";

test("private beta gate blocks unsafe exposure and missing visual smoke, not hidden review backlog", () => {
  const gate = evaluateBetaReleaseGate();
  assert.equal(gate.ready, false);
  assert.equal(gate.scientificReady, false);
  assert.equal(gate.checks.minimumCards, 148);
  assert.equal(gate.checks.genusCards, 66);
  assert.equal(gate.checks.searchDocuments, 214);
  assert.equal(gate.checks.nomenclatureConflicts, 0);
  assert.equal(gate.checks.nomenclatureUnresolved, 0);
  assert.ok(gate.checks.reviewNeededClaims > 0);
  assert.equal(gate.checks.minimumPublicScientificLeaks, 0);
  assert.equal(gate.checks.genusPublicScientificLeaks, 0);
  assert.equal(
    gate.blockers.some((item) => item.includes("Scientific review queue")),
    false,
  );
  assert.match(gate.blockers.join("\n"), /visual viewport smoke test has not been verified/i);
  assert.match(gate.scientificBlockers.join("\n"), /Scientific review queue is not empty/);
  assert.match(gate.scientificBlockers.join("\n"), /Independent mycological review has not been verified/);
});

test("verified visual smoke can make private beta ready while scientific completion stays blocked", () => {
  const pretendVerified = {
    ...attestations,
    visualViewportSmoke: {
      ...attestations.visualViewportSmoke,
      status: "verified" as const,
      verifiedBy: "qa",
      verifiedAt: "2026-09-22T00:00:00Z",
      commitSha: "test",
    },
    independentMycologicalReview: {
      ...attestations.independentMycologicalReview,
      status: "verified" as const,
      verifiedBy: "reviewer",
      verifiedAt: "2026-09-22T00:00:00Z",
    },
  };
  const gate = evaluateBetaReleaseGate(pretendVerified);
  assert.equal(gate.ready, true, gate.blockers.join("\n"));
  assert.equal(gate.scientificReady, false);
  assert.equal(
    gate.scientificBlockers.some((item) => item.includes("Scientific review queue")),
    true,
  );
});
