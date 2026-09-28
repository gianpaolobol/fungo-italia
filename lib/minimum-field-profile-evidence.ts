import type {
  CatalogClaimRecord,
  EvidenceRecord,
} from "./catalog-evidence.ts";
import {
  AUDITED_MINIMUM_FIELD_PROFILE_DATE,
  AUDITED_MINIMUM_FIELD_PROFILE_REVIEW_STATUS,
  AUDITED_MINIMUM_FIELD_PROFILE_VERSION,
  fieldProfileForSourceLabel,
} from "./minimum-field-profiles.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";

export const AUDITED_FIELD_PROFILE_SOURCE_ID =
  "AUDIT-minimum-3plus1-baseline-1.0";

const REVIEWED_AT = `${AUDITED_MINIMUM_FIELD_PROFILE_DATE}T20:00:00+02:00`;
const REVIEWED_BY = "scientific-audit-workflow-v1";

export const auditedFieldProfileEvidence: EvidenceRecord[] =
  sourceMinimumLearningUnits.map((unit) => {
    const profile = fieldProfileForSourceLabel(unit.sourceLabel);
    if (!profile) throw new Error(`Missing audited field profile for ${unit.sourceLabel}`);

    return {
      evidenceId: `evidence-field-profile-${unit.id}`,
      sourceId: AUDITED_FIELD_PROFILE_SOURCE_ID,
      sourceLocation:
        `Scientific Baseline 1.0; unità S1 ${unit.id}; audit taxon-per-taxon`,
      claimType: "morphology",
      claimSummary:
        `Profilo 3+1 di campo auditato per ${unit.sourceLabel}: tre caratteri principali e un carattere differenziante, senza reagenti, microscopia, DNA o assaggio nel livello base.`,
      evidenceStrength: "expertAssessment",
      extractedBy: REVIEWED_BY,
      extractedAt: REVIEWED_AT,
      reviewedBy: REVIEWED_BY,
      reviewedAt: REVIEWED_AT,
      reviewStatus: AUDITED_MINIMUM_FIELD_PROFILE_REVIEW_STATUS,
      notes:
        "Audit scientifico interno cross-source completato nel progetto. Non equivale alla revisione micologica indipendente richiesta per l'approvazione finale dei claim di sicurezza/commestibilità.",
    };
  });

export const auditedFieldProfileClaims: CatalogClaimRecord[] =
  sourceMinimumLearningUnits.map((unit) => {
    const profile = fieldProfileForSourceLabel(unit.sourceLabel);
    if (!profile) throw new Error(`Missing audited field profile for ${unit.sourceLabel}`);

    return {
      claimId: `claim-field-profile-${unit.id}`,
      subjectType: "learningUnit",
      subjectId: unit.id,
      fieldPath: "card.minimum.fieldProfile",
      claimType: "morphology",
      valueJson: JSON.stringify({
        ...profile,
        version: AUDITED_MINIMUM_FIELD_PROFILE_VERSION,
        auditedAt: AUDITED_MINIMUM_FIELD_PROFILE_DATE,
      }),
      evidenceIds: [`evidence-field-profile-${unit.id}`],
      reviewStatus: AUDITED_MINIMUM_FIELD_PROFILE_REVIEW_STATUS,
    };
  });
