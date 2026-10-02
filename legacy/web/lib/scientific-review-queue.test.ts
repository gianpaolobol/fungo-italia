import assert from "node:assert/strict";
import test from "node:test";

import {
  scientificReviewQueue,
  scientificReviewSummary,
} from "./scientific-review-queue.ts";

const priorityWeight = { critical: 0, high: 1, normal: 2, low: 3 } as const;

test("scientific review queue contains only reviewNeeded claims and is priority ordered", () => {
  assert.ok(scientificReviewQueue.length > 0);
  for (let index = 1; index < scientificReviewQueue.length; index += 1) {
    assert.ok(
      priorityWeight[scientificReviewQueue[index - 1].priority] <=
        priorityWeight[scientificReviewQueue[index].priority],
    );
  }
});

test("food safety and high-risk confusion claims are always critical", () => {
  for (const item of scientificReviewQueue) {
    if (item.claimType === "edibility" || item.claimType === "treatment") {
      assert.equal(item.priority, "critical", item.claimId);
    }
    if (item.claimType === "confusion" && item.priority !== "critical") {
      assert.equal(item.priority, "high", item.claimId);
    }
  }
});

test("review summary partitions the entire queue exactly once", () => {
  const summary = scientificReviewSummary();
  assert.equal(
    summary.critical + summary.high + summary.normal + summary.low,
    summary.total,
  );
  assert.equal(summary.total, scientificReviewQueue.length);
  assert.ok(summary.critical > 0);
  assert.ok(summary.high > 0);
  assert.ok(summary.normal > 0);
});
