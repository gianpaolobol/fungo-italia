import assert from "node:assert/strict";
import test from "node:test";

import attestations from "../data/catalog/release-attestations.json" with { type: "json" };
import { evaluateBetaReleaseGate } from "./beta-release-gate.ts";

test("current beta release gate blocks only explicit unfinished final requirements", () => {
  const gate = evaluateBetaReleaseGate();
  assert.equal(gate.ready, false);
  assert.equal(gate.checks.minimumCards, 148);
  assert.equal(gate.checks.genusCards, 66);
  assert.equal(gate.checks.searchDocuments, 214);
  assert.equal(gate.checks.nomenclatureConflicts, 0);
  assert.equal(gate.checks.nomenclatureUnresolved, 0);
  assert.ok(gate.checks.reviewNeededClaims > 0);
  assert.match(gate.blockers.join("\n"), /Scientific review queue is not empty/);
  assert.match(gate.blockers.join("\n"), /visual viewport smoke test has not been verified/i);
  assert.match(gate.blockers.join("\n"), /Independent mycological review has not been verified/);
});

test("attestations cannot bypass a non-empty scientific review queue", () => {
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
  assert.equal(gate.ready, false);
  assert.equal(
    gate.blockers.some((item) => item.includes("Scientific review queue")),
    true,
  );
});
