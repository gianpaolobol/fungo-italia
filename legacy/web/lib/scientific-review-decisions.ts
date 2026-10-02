import type { ScientificReviewPriority } from "./scientific-review-queue.ts";

export type ScientificPacketDecision =
  | "approve"
  | "reject"
  | "requestChanges";

export interface ScientificPacketReviewDecision {
  packetId: string;
  reviewerId: string;
  decision: ScientificPacketDecision;
  notes: string;
  decidedAt: string;
}

export type ScientificPacketReviewState =
  | "pending"
  | "inReview"
  | "approved"
  | "rejected"
  | "changesRequested";

export interface ScientificPacketReviewEvaluation {
  state: ScientificPacketReviewState;
  requiredApprovals: number;
  approvalCount: number;
  reviewerCount: number;
  blockers: string[];
}

export function requiredScientificApprovals(
  priority: ScientificReviewPriority,
) {
  return priority === "critical" ? 2 : 1;
}

export function evaluateScientificPacketReview(
  packetId: string,
  priority: ScientificReviewPriority,
  decisions: readonly ScientificPacketReviewDecision[],
): ScientificPacketReviewEvaluation {
  const packetDecisions = decisions.filter(
    (decision) => decision.packetId === packetId,
  );
  const latestByReviewer = new Map<string, ScientificPacketReviewDecision>();

  for (const decision of packetDecisions) {
    const previous = latestByReviewer.get(decision.reviewerId);
    if (
      !previous ||
      decision.decidedAt.localeCompare(previous.decidedAt) >= 0
    ) {
      latestByReviewer.set(decision.reviewerId, decision);
    }
  }

  const effective = [...latestByReviewer.values()];
  const requiredApprovals = requiredScientificApprovals(priority);
  const approvals = effective.filter(
    (decision) => decision.decision === "approve",
  );
  const rejected = effective.some(
    (decision) => decision.decision === "reject",
  );
  const changesRequested = effective.some(
    (decision) => decision.decision === "requestChanges",
  );

  const blockers: string[] = [];

  if (rejected) {
    blockers.push("At least one reviewer rejected the packet.");
    return {
      state: "rejected",
      requiredApprovals,
      approvalCount: approvals.length,
      reviewerCount: effective.length,
      blockers,
    };
  }

  if (changesRequested) {
    blockers.push("At least one reviewer requested changes.");
    return {
      state: "changesRequested",
      requiredApprovals,
      approvalCount: approvals.length,
      reviewerCount: effective.length,
      blockers,
    };
  }

  if (approvals.length >= requiredApprovals) {
    return {
      state: "approved",
      requiredApprovals,
      approvalCount: approvals.length,
      reviewerCount: effective.length,
      blockers,
    };
  }

  if (approvals.length > 0) {
    blockers.push(
      `Needs ${requiredApprovals - approvals.length} additional independent approval(s).`,
    );
    return {
      state: "inReview",
      requiredApprovals,
      approvalCount: approvals.length,
      reviewerCount: effective.length,
      blockers,
    };
  }

  blockers.push(`Needs ${requiredApprovals} reviewer approval(s).`);
  return {
    state: "pending",
    requiredApprovals,
    approvalCount: 0,
    reviewerCount: effective.length,
    blockers,
  };
}
