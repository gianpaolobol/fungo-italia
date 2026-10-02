import type {
  CatalogClaimRecord,
  EvidenceRecord,
} from "./catalog-evidence.ts";
import {
  minimumCardDraftClaims,
  minimumCardDraftEvidence,
} from "./minimum-card-editorial.ts";
import {
  minimumGenusCardClaims,
  minimumGenusCardEvidence,
} from "./minimum-genus-editorial.ts";
import {
  scientificReviewQueue,
  type ScientificReviewPriority,
} from "./scientific-review-queue.ts";

export interface ScientificReviewBatch {
  batchId: string;
  claimType: CatalogClaimRecord["claimType"];
  priority: ScientificReviewPriority;
  claimIds: string[];
  subjectIds: string[];
  valueJson: string;
  evidenceIds: string[];
  reviewMode: "reusableEditorialPattern" | "atomicScientificClaim";
}

const claims = [
  ...minimumCardDraftClaims,
  ...minimumGenusCardClaims,
];

const evidence = [
  ...minimumCardDraftEvidence,
  ...minimumGenusCardEvidence,
];

const evidenceById = new Map(evidence.map((item) => [item.evidenceId, item]));
const priorityByClaim = new Map(
  scientificReviewQueue.map((item) => [item.claimId, item.priority]),
);

function atomicEvidenceSignature(claim: CatalogClaimRecord) {
  return claim.evidenceIds
    .map((id) => {
      const item = evidenceById.get(id);
      return item
        ? [item.sourceId, item.sourceLocation, item.claimSummary].join("|")
        : id;
    })
    .sort()
    .join("||");
}

function reviewMode(claim: CatalogClaimRecord): ScientificReviewBatch["reviewMode"] {
  return claim.claimType === "morphology" || claim.claimType === "ecology"
    ? "reusableEditorialPattern"
    : "atomicScientificClaim";
}

function batchKey(claim: CatalogClaimRecord) {
  const mode = reviewMode(claim);
  if (mode === "reusableEditorialPattern") {
    return [claim.claimType, claim.valueJson].join("::");
  }
  return [
    claim.claimType,
    claim.valueJson,
    atomicEvidenceSignature(claim),
  ].join("::");
}

const reviewNeeded = claims.filter((claim) => claim.reviewStatus === "reviewNeeded");
const buckets = new Map<string, CatalogClaimRecord[]>();
for (const claim of reviewNeeded) {
  const key = batchKey(claim);
  const bucket = buckets.get(key) ?? [];
  bucket.push(claim);
  buckets.set(key, bucket);
}

const weight: Record<ScientificReviewPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export const scientificReviewBatches: ScientificReviewBatch[] =
  [...buckets.values()]
    .map((bucket, index) => {
      const first = bucket[0];
      const priorities = bucket
        .map((claim) => priorityByClaim.get(claim.claimId) ?? "low")
        .sort((a, b) => weight[a] - weight[b]);

      return {
        batchId: `review-batch-${String(index + 1).padStart(3, "0")}`,
        claimType: first.claimType,
        priority: priorities[0],
        claimIds: bucket.map((claim) => claim.claimId).sort(),
        subjectIds: [...new Set(bucket.map((claim) => claim.subjectId))].sort(),
        valueJson: first.valueJson,
        evidenceIds: [...new Set(bucket.flatMap((claim) => claim.evidenceIds))].sort(),
        reviewMode: reviewMode(first),
      };
    })
    .sort((left, right) =>
      weight[left.priority] - weight[right.priority] ||
      left.claimType.localeCompare(right.claimType) ||
      left.batchId.localeCompare(right.batchId)
    );

export function scientificReviewBatchSummary(
  batches: readonly ScientificReviewBatch[] = scientificReviewBatches,
) {
  return {
    batches: batches.length,
    claims: batches.reduce((sum, batch) => sum + batch.claimIds.length, 0),
    reusableBatches: batches.filter(
      (batch) => batch.reviewMode === "reusableEditorialPattern",
    ).length,
    atomicBatches: batches.filter(
      (batch) => batch.reviewMode === "atomicScientificClaim",
    ).length,
    critical: batches.filter((batch) => batch.priority === "critical").length,
    high: batches.filter((batch) => batch.priority === "high").length,
    normal: batches.filter((batch) => batch.priority === "normal").length,
    low: batches.filter((batch) => batch.priority === "low").length,
  };
}

export function evidenceForReviewBatch(batch: ScientificReviewBatch): EvidenceRecord[] {
  return batch.evidenceIds
    .map((id) => evidenceById.get(id))
    .filter((item): item is EvidenceRecord => Boolean(item));
}
