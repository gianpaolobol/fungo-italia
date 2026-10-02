import type { EvidenceReviewStatus } from "./catalog-evidence.ts";
import type { MinimumAtlasCard, MinimumCardConfusion } from "./minimum-card.ts";
import {
  AUDITED_MINIMUM_FIELD_PROFILE_DATE,
  AUDITED_MINIMUM_FIELD_PROFILE_REVIEW_STATUS,
  AUDITED_MINIMUM_FIELD_PROFILE_VERSION,
} from "./minimum-field-profiles.ts";

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


export function publicAuditedFieldProfile(card: MinimumAtlasCard) {
  return {
    ...card.fieldProfile,
    characters: [...card.fieldProfile.characters] as [string, string, string],
    version: AUDITED_MINIMUM_FIELD_PROFILE_VERSION,
    auditedAt: AUDITED_MINIMUM_FIELD_PROFILE_DATE,
    reviewStatus: AUDITED_MINIMUM_FIELD_PROFILE_REVIEW_STATUS,
    reviewScope: "internal" as const,
    independentReviewStatus: "not-attested" as const,
  };
}