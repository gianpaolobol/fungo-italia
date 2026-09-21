import { scientificReviewBatchSummary } from "../lib/scientific-review-batches.ts";
import { scientificReviewQueue, scientificReviewSummary } from "../lib/scientific-review-queue.ts";

const summary = scientificReviewSummary();
console.log(`Scientific review queue: total=${summary.total}; critical=${summary.critical}; high=${summary.high}; normal=${summary.normal}; low=${summary.low}.`);
console.log(`Review claim types: ${JSON.stringify(summary.byClaimType)}.`);
console.log("First critical claims:");
for (const item of scientificReviewQueue.filter((entry) => entry.priority === "critical").slice(0, 12)) {
  console.log(`- ${item.claimId} | ${item.claimType} | ${item.reason}`);
}

const batchSummary = scientificReviewBatchSummary();
console.log(`Scientific review batches: batches=${batchSummary.batches}; claims=${batchSummary.claims}; reusable=${batchSummary.reusableBatches}; atomic=${batchSummary.atomicBatches}; critical=${batchSummary.critical}; high=${batchSummary.high}; normal=${batchSummary.normal}; low=${batchSummary.low}.`);
