import assert from "node:assert/strict";
import test from "node:test";

import { scientificReviewQueue } from "./scientific-review-queue.ts";
import {
  evidenceForReviewBatch,
  scientificReviewBatches,
  scientificReviewBatchSummary,
} from "./scientific-review-batches.ts";

test("review batches cover every review-needed claim exactly once", () => {
  const batched = scientificReviewBatches.flatMap((batch) => batch.claimIds);
  assert.equal(batched.length, scientificReviewQueue.length);
  assert.equal(new Set(batched).size, batched.length);
  assert.deepEqual(
    new Set(batched),
    new Set(scientificReviewQueue.map((item) => item.claimId)),
  );
});

test("reusable batches are restricted to morphology and ecology", () => {
  for (const batch of scientificReviewBatches) {
    if (batch.reviewMode === "reusableEditorialPattern") {
      assert.ok(
        batch.claimType === "morphology" || batch.claimType === "ecology",
        batch.batchId,
      );
    }
  }
});

test("critical food safety and confusion review remains atomic", () => {
  for (const batch of scientificReviewBatches) {
    if (batch.claimType === "edibility" || batch.claimType === "confusion") {
      assert.equal(batch.reviewMode, "atomicScientificClaim", batch.batchId);
    }
  }
});

test("every batch retains its evidence packet", () => {
  for (const batch of scientificReviewBatches) {
    const evidence = evidenceForReviewBatch(batch);
    assert.equal(evidence.length, batch.evidenceIds.length, batch.batchId);
    assert.ok(evidence.length > 0, batch.batchId);
  }
});

test("batching reduces the human review unit count without losing claims", () => {
  const summary = scientificReviewBatchSummary();
  assert.equal(summary.claims, scientificReviewQueue.length);
  assert.ok(summary.batches < summary.claims);
  assert.ok(summary.reusableBatches > 0);
  assert.ok(summary.atomicBatches > 0);
});
