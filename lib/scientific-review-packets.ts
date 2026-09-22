import sourcesJson from "../data/catalog/sources.json" with { type: "json" };

import type {
  CatalogClaimRecord,
  CatalogSourceRecord,
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
  evidenceForReviewBatch,
  scientificReviewBatches,
  type ScientificReviewBatch,
} from "./scientific-review-batches.ts";

export interface ScientificReviewPacketEvidence {
  evidenceId: string;
  sourceId: string;
  sourceTitle: string;
  sourceType: CatalogSourceRecord["sourceType"];
  sourceLocation: string;
  sourceUrl: string | null;
  claimSummary: string;
  evidenceStrength: EvidenceRecord["evidenceStrength"];
  reviewStatus: EvidenceRecord["reviewStatus"];
  notes: string | null;
}

export interface ScientificReviewPacketClaim {
  claimId: string;
  subjectType: CatalogClaimRecord["subjectType"];
  subjectId: string;
  fieldPath: string;
  claimType: CatalogClaimRecord["claimType"];
  valueJson: string;
  reviewStatus: CatalogClaimRecord["reviewStatus"];
}

export interface ScientificReviewPacket {
  packetId: string;
  batchId: string;
  priority: ScientificReviewBatch["priority"];
  claimType: ScientificReviewBatch["claimType"];
  reviewMode: ScientificReviewBatch["reviewMode"];
  claimIds: string[];
  subjectIds: string[];
  claims: ScientificReviewPacketClaim[];
  evidence: ScientificReviewPacketEvidence[];
  decisionRequired:
    | "approve-or-reject-safety"
    | "review-description"
    | "review-taxonomy"
    | "review-other";
}

const sources = sourcesJson as CatalogSourceRecord[];
const sourceById = new Map(sources.map((source) => [source.sourceId, source]));

const claims = [
  ...minimumCardDraftClaims,
  ...minimumGenusCardClaims,
];
const claimById = new Map(claims.map((claim) => [claim.claimId, claim]));

function decisionRequired(
  batch: ScientificReviewBatch,
): ScientificReviewPacket["decisionRequired"] {
  if (
    batch.claimType === "edibility" ||
    batch.claimType === "treatment" ||
    batch.claimType === "confusion"
  ) {
    return "approve-or-reject-safety";
  }
  if (batch.claimType === "taxonomy") return "review-taxonomy";
  if (
    batch.claimType === "morphology" ||
    batch.claimType === "ecology"
  ) {
    return "review-description";
  }
  return "review-other";
}

function packetEvidence(
  batch: ScientificReviewBatch,
): ScientificReviewPacketEvidence[] {
  return evidenceForReviewBatch(batch).map((item) => {
    const source = sourceById.get(item.sourceId);
    if (!source) {
      throw new Error(
        `Review packet ${batch.batchId} references unknown source ${item.sourceId}`,
      );
    }
    return {
      evidenceId: item.evidenceId,
      sourceId: item.sourceId,
      sourceTitle: source.title,
      sourceType: source.sourceType,
      sourceLocation: item.sourceLocation,
      sourceUrl: source.url,
      claimSummary: item.claimSummary,
      evidenceStrength: item.evidenceStrength,
      reviewStatus: item.reviewStatus,
      notes: item.notes,
    };
  });
}

export const scientificReviewPackets: ScientificReviewPacket[] =
  scientificReviewBatches.map((batch) => {
    const packetClaims = batch.claimIds.map((claimId) => {
      const claim = claimById.get(claimId);
      if (!claim) {
        throw new Error(
          `Review packet ${batch.batchId} references unknown claim ${claimId}`,
        );
      }
      return {
        claimId: claim.claimId,
        subjectType: claim.subjectType,
        subjectId: claim.subjectId,
        fieldPath: claim.fieldPath,
        claimType: claim.claimType,
        valueJson: claim.valueJson,
        reviewStatus: claim.reviewStatus,
      };
    });

    return {
      packetId: `packet-${batch.batchId}`,
      batchId: batch.batchId,
      priority: batch.priority,
      claimType: batch.claimType,
      reviewMode: batch.reviewMode,
      claimIds: [...batch.claimIds],
      subjectIds: [...batch.subjectIds],
      claims: packetClaims,
      evidence: packetEvidence(batch),
      decisionRequired: decisionRequired(batch),
    };
  });

export function scientificReviewPacketSummary(
  packets: readonly ScientificReviewPacket[] = scientificReviewPackets,
) {
  return {
    packets: packets.length,
    claims: packets.reduce((sum, packet) => sum + packet.claimIds.length, 0),
    critical: packets.filter((packet) => packet.priority === "critical").length,
    high: packets.filter((packet) => packet.priority === "high").length,
    normal: packets.filter((packet) => packet.priority === "normal").length,
    low: packets.filter((packet) => packet.priority === "low").length,
    safety: packets.filter(
      (packet) => packet.decisionRequired === "approve-or-reject-safety",
    ).length,
    descriptive: packets.filter(
      (packet) => packet.decisionRequired === "review-description",
    ).length,
    taxonomy: packets.filter(
      (packet) => packet.decisionRequired === "review-taxonomy",
    ).length,
  };
}
