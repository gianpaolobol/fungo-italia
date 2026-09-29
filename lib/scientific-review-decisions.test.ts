import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateScientificPacketReview,
  requiredScientificApprovals,
  type ScientificPacketReviewDecision,
} from "./scientific-review-decisions.ts";

function decision(
  reviewerId: string,
  value: ScientificPacketReviewDecision["decision"],
  decidedAt: string,
): ScientificPacketReviewDecision {
  return {
    packetId: "packet-review-batch-001",
    reviewerId,
    decision: value,
    notes: value,
    decidedAt,
  };
}

test("critical packets require two distinct reviewer approvals", () => {
  assert.equal(requiredScientificApprovals("critical"), 2);

  const one = evaluateScientificPacketReview(
    "packet-review-batch-001",
    "critical",
    [decision("reviewer-a", "approve", "2026-09-22T10:00:00Z")],
  );
  assert.equal(one.state, "inReview");
  assert.equal(one.approvalCount, 1);
  assert.equal(one.requiredApprovals, 2);

  const two = evaluateScientificPacketReview(
    "packet-review-batch-001",
    "critical",
    [
      decision("reviewer-a", "approve", "2026-09-22T10:00:00Z"),
      decision("reviewer-b", "approve", "2026-09-22T10:01:00Z"),
    ],
  );
  assert.equal(two.state, "approved");
  assert.equal(two.approvalCount, 2);
});

test("high and normal packets require one approval", () => {
  for (const priority of ["high", "normal"] as const) {
    assert.equal(requiredScientificApprovals(priority), 1);
    const result = evaluateScientificPacketReview(
      "packet-review-batch-001",
      priority,
      [decision("reviewer-a", "approve", "2026-09-22T10:00:00Z")],
    );
    assert.equal(result.state, "approved", priority);
  }
});

test("one reviewer cannot satisfy critical double approval by approving twice", () => {
  const result = evaluateScientificPacketReview(
    "packet-review-batch-001",
    "critical",
    [
      decision("reviewer-a", "approve", "2026-09-22T10:00:00Z"),
      decision("reviewer-a", "approve", "2026-09-22T10:05:00Z"),
    ],
  );

  assert.equal(result.state, "inReview");
  assert.equal(result.reviewerCount, 1);
  assert.equal(result.approvalCount, 1);
});

test("latest decision by the same reviewer replaces their previous decision", () => {
  const result = evaluateScientificPacketReview(
    "packet-review-batch-001",
    "high",
    [
      decision("reviewer-a", "approve", "2026-09-22T10:00:00Z"),
      decision("reviewer-a", "requestChanges", "2026-09-22T10:05:00Z"),
    ],
  );

  assert.equal(result.state, "changesRequested");
  assert.equal(result.approvalCount, 0);
});

test("reject and requestChanges always block packet approval", () => {
  const rejected = evaluateScientificPacketReview(
    "packet-review-batch-001",
    "critical",
    [
      decision("reviewer-a", "approve", "2026-09-22T10:00:00Z"),
      decision("reviewer-b", "reject", "2026-09-22T10:01:00Z"),
    ],
  );
  assert.equal(rejected.state, "rejected");

  const changes = evaluateScientificPacketReview(
    "packet-review-batch-001",
    "critical",
    [
      decision("reviewer-a", "approve", "2026-09-22T10:00:00Z"),
      decision("reviewer-b", "requestChanges", "2026-09-22T10:01:00Z"),
    ],
  );
  assert.equal(changes.state, "changesRequested");
});
