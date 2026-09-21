import type { EvidenceReviewStatus } from "./catalog-evidence.ts";
import type { MinimumAtlasCard, MinimumCardConfusion } from "./minimum-card.ts";

export function canPublishDescriptiveScientificContent(
  status: EvidenceReviewStatus,
) {
  return status === "reviewed" || status === "approved";
}

export function canPublishSafetyContent(
  status: EvidenceReviewStatus,
) {
  return status === "approved";
}

export function publicEdibilityCategory(card: MinimumAtlasCard) {
  return canPublishSafetyContent(card.reviewStatus)
    ? card.edibilityCategory
    : null;
}

export function publicSafetySummary(card: MinimumAtlasCard) {
  return canPublishSafetyContent(card.reviewStatus)
    ? card.safetySummary
    : "Valutazione alimentare non pubblicata: in attesa di approvazione micologica indipendente.";
}

export function publicConfusionWarnings(
  card: MinimumAtlasCard,
): MinimumCardConfusion[] {
  return canPublishSafetyContent(card.reviewStatus)
    ? card.confusionWarnings
    : [];
}

export function publicDescriptiveCardContent(card: MinimumAtlasCard) {
  if (!canPublishDescriptiveScientificContent(card.reviewStatus)) {
    return {
      terminology: [] as string[],
      essentialMorphology: [] as string[],
      ecologySummary: null as string | null,
      pending: true,
    };
  }
  return {
    terminology: [...card.terminology],
    essentialMorphology: [...card.essentialMorphology],
    ecologySummary: card.ecologySummary,
    pending: false,
  };
}
