import type { CatalogClaimRecord, ClaimType } from "./catalog-evidence.ts";
import { minimumCardDraftClaims } from "./minimum-card-editorial.ts";
import { minimumGenusCardClaims } from "./minimum-genus-editorial.ts";

export type ScientificReviewPriority = "critical" | "high" | "normal" | "low";

export interface ScientificReviewQueueItem {
  claimId: string;
  subjectType: CatalogClaimRecord["subjectType"];
  subjectId: string;
  fieldPath: string;
  claimType: ClaimType;
  priority: ScientificReviewPriority;
  reason: string;
}

function parsedValue(claim: CatalogClaimRecord): Record<string, unknown> {
  try {
    const parsed = JSON.parse(claim.valueJson) as unknown;
    return parsed && typeof parsed === "object"
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function priorityFor(claim: CatalogClaimRecord): {
  priority: ScientificReviewPriority;
  reason: string;
} {
  const value = parsedValue(claim);

  if (claim.claimType === "confusion") {
    const risk = typeof value.risk === "string" ? value.risk : "";
    if (risk === "deadly") {
      return {
        priority: "critical",
        reason: "Confusione a rischio mortale: richiede approvazione indipendente prima della pubblicazione.",
      };
    }
    if (risk === "high") {
      return {
        priority: "critical",
        reason: "Confusione ad alto rischio: richiede approvazione indipendente prima della pubblicazione.",
      };
    }
    return {
      priority: "high",
      reason: "Relazione di confusione da verificare prima dell'uso pubblico.",
    };
  }

  if (claim.claimType === "edibility" || claim.claimType === "treatment") {
    return {
      priority: "critical",
      reason: "Commestibilita o trattamento alimentare: pubblicabile solo dopo approvazione micologica.",
    };
  }

  if (claim.claimType === "morphology") {
    return {
      priority: "high",
      reason: "Caratteri diagnostici editoriali da verificare prima di presentarli come fatti.",
    };
  }

  if (claim.claimType === "taxonomy") {
    return {
      priority: "high",
      reason: "Nota tassonomica non ancora verificata in modo sufficiente per la pubblicazione.",
    };
  }

  if (claim.claimType === "ecology") {
    return {
      priority: "normal",
      reason: "Sintesi ecologica editoriale da corroborare con fonte complementare.",
    };
  }

  return {
    priority: "low",
    reason: "Claim editoriale in attesa di revisione.",
  };
}

const reviewableClaims = [
  ...minimumCardDraftClaims,
  ...minimumGenusCardClaims,
].filter((claim) => claim.reviewStatus === "reviewNeeded");

const priorityOrder: Record<ScientificReviewPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export const scientificReviewQueue: ScientificReviewQueueItem[] =
  reviewableClaims
    .map((claim) => {
      const classified = priorityFor(claim);
      return {
        claimId: claim.claimId,
        subjectType: claim.subjectType,
        subjectId: claim.subjectId,
        fieldPath: claim.fieldPath,
        claimType: claim.claimType,
        ...classified,
      };
    })
    .sort((left, right) =>
      priorityOrder[left.priority] - priorityOrder[right.priority] ||
      left.claimType.localeCompare(right.claimType) ||
      left.claimId.localeCompare(right.claimId)
    );

export function scientificReviewSummary(
  queue: readonly ScientificReviewQueueItem[] = scientificReviewQueue,
) {
  return {
    total: queue.length,
    critical: queue.filter((item) => item.priority === "critical").length,
    high: queue.filter((item) => item.priority === "high").length,
    normal: queue.filter((item) => item.priority === "normal").length,
    low: queue.filter((item) => item.priority === "low").length,
    byClaimType: Object.fromEntries(
      [...new Set(queue.map((item) => item.claimType))]
        .sort()
        .map((claimType) => [
          claimType,
          queue.filter((item) => item.claimType === claimType).length,
        ]),
    ),
  };
}
