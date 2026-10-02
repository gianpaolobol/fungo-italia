import attestationsJson from "../data/catalog/release-attestations.json" with { type: "json" };

import { catalogSearchDocuments } from "./catalog-search.ts";
import { minimumCards } from "./minimum-cards.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import {
  nomenclatureConflicts,
  unresolvedNomenclatureMappings,
} from "./minimum-nomenclature.ts";
import { scientificReviewQueue } from "./scientific-review-queue.ts";
import {
  auditedMinimumFieldProfiles,
  validateAuditedMinimumFieldProfiles,
} from "./minimum-field-profiles.ts";
import {
  auditedFieldProfileClaims,
  auditedFieldProfileEvidence,
} from "./minimum-field-profile-evidence.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import {
  publicConfusionWarnings,
  publicDescriptiveCardContent,
  publicEdibilityCategory,
} from "./public-scientific-policy.ts";
import { genusCardHasPublicScientificLeak } from "./public-genus-policy.ts";

interface ReleaseAttestation {
  status: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
}
export interface Attestations {
  version: number;
  visualViewportSmoke: ReleaseAttestation & {
    requiredViewports: string[];
    commitSha: string | null;
  };
  independentMycologicalReview: ReleaseAttestation & { scope: string };
}

export interface BetaReleaseGate {
  ready: boolean;
  blockers: string[];
  scientificReady: boolean;
  scientificBlockers: string[];
  checks: {
    minimumCards: number;
    genusCards: number;
    searchDocuments: number;
    nomenclatureConflicts: number;
    nomenclatureUnresolved: number;
    reviewNeededClaims: number;
    auditedFieldProfiles: number;
    auditedFieldProfileErrors: number;
    auditedFieldProfileClaims: number;
    auditedFieldProfileEvidence: number;
    auditedFieldSafetyChecks: number;
    minimumPublicScientificLeaks: number;
    genusPublicScientificLeaks: number;
    visualViewportSmoke: string;
    independentMycologicalReview: string;
  };
}

export function evaluateBetaReleaseGate(
  attestations: Attestations = attestationsJson,
): BetaReleaseGate {
  const blockers: string[] = [];
  const scientificBlockers: string[] = [];

  const fieldProfileValidation = validateAuditedMinimumFieldProfiles(
    sourceMinimumLearningUnits.map((unit) => unit.sourceLabel),
  );
  const auditedFieldSafetyChecks = Object.values(auditedMinimumFieldProfiles)
    .filter((profile) => Boolean(profile.safetyCheck?.trim())).length;

  const minimumPublicScientificLeaks = minimumCards.filter((card) => {
    if (card.reviewStatus === "reviewed" || card.reviewStatus === "approved") return false;
    const descriptive = publicDescriptiveCardContent(card);
    return (
      descriptive.terminology.length > 0 ||
      descriptive.essentialMorphology.length > 0 ||
      descriptive.ecologySummary !== null ||
      publicEdibilityCategory(card) !== null ||
      publicConfusionWarnings(card).length > 0
    );
  }).length;

  const genusPublicScientificLeaks = minimumGenusCards.filter(
    (card) => genusCardHasPublicScientificLeak(card),
  ).length;

  if (minimumCards.length !== 148) {
    blockers.push(`Expected 148 minimum cards, found ${minimumCards.length}`);
  }
  if (!fieldProfileValidation.ok) {
    blockers.push(
      `Audited 3+1 field-profile baseline is invalid: ${fieldProfileValidation.errors.join("; ")}`,
    );
  }
  if (auditedFieldProfileClaims.length !== 148) {
    blockers.push(`Expected 148 audited field-profile claims, found ${auditedFieldProfileClaims.length}`);
  }
  if (auditedFieldProfileEvidence.length !== 156) {
    blockers.push(`Expected 156 audited/source-enriched field-profile evidence records, found ${auditedFieldProfileEvidence.length}`);
  }
  if (auditedFieldSafetyChecks !== 4) {
    blockers.push(`Expected 4 explicit audited safety checks after source enrichment, found ${auditedFieldSafetyChecks}`);
  }
  if (minimumGenusCards.length !== 66) {
    blockers.push(`Expected 66 genus/group cards, found ${minimumGenusCards.length}`);
  }
  if (catalogSearchDocuments.length !== 214) {
    blockers.push(`Expected 214 structured atlas search documents, found ${catalogSearchDocuments.length}`);
  }
  if (nomenclatureConflicts.length > 0) {
    blockers.push(`Nomenclature conflicts remain: ${nomenclatureConflicts.length}`);
  }
  if (unresolvedNomenclatureMappings.length > 0) {
    blockers.push(`Unresolved nomenclature mappings remain: ${unresolvedNomenclatureMappings.length}`);
  }
  if (minimumPublicScientificLeaks > 0) {
    blockers.push(`Unreviewed minimum-card scientific content is publicly exposed: ${minimumPublicScientificLeaks} cards`);
  }
  if (genusPublicScientificLeaks > 0) {
    blockers.push(`Unreviewed genus/group scientific content is publicly exposed: ${genusPublicScientificLeaks} cards`);
  }
  if (attestations.visualViewportSmoke.status !== "verified") {
    blockers.push("Final visual viewport smoke test has not been verified");
  }
  if (scientificReviewQueue.length > 0) {
    scientificBlockers.push(`Scientific review queue is not empty: ${scientificReviewQueue.length} claims remain`);
  }
  if (attestations.independentMycologicalReview.status !== "verified") {
    scientificBlockers.push("Independent mycological review has not been verified");
  }

  return {
    ready: blockers.length === 0,
    blockers,
    scientificReady: blockers.length === 0 && scientificBlockers.length === 0,
    scientificBlockers,
    checks: {
      minimumCards: minimumCards.length,
      genusCards: minimumGenusCards.length,
      searchDocuments: catalogSearchDocuments.length,
      nomenclatureConflicts: nomenclatureConflicts.length,
      nomenclatureUnresolved: unresolvedNomenclatureMappings.length,
      reviewNeededClaims: scientificReviewQueue.length,
      auditedFieldProfiles: fieldProfileValidation.profileCount,
      auditedFieldProfileErrors: fieldProfileValidation.errors.length,
      auditedFieldProfileClaims: auditedFieldProfileClaims.length,
      auditedFieldProfileEvidence: auditedFieldProfileEvidence.length,
      auditedFieldSafetyChecks,
      minimumPublicScientificLeaks,
      genusPublicScientificLeaks,
      visualViewportSmoke: attestations.visualViewportSmoke.status,
      independentMycologicalReview: attestations.independentMycologicalReview.status,
    },
  };
}
