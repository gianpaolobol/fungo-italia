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
const SOURCE_ENRICHMENT_REVIEWED_AT = "2026-09-29T20:45:00+02:00";
const SOURCE_ENRICHMENT_REVIEWED_BY = "source-enrichment-audit-2026-09-29";

const sourceEnrichmentByLabel: Readonly<
  Record<string, readonly { sourceId: string; sourceLocation: string; summary: string }[]>
> = {
  "Agaricus bisporus": [
    {
      sourceId: "S3-campania-funghi-2007",
      sourceLocation: "scheda Agaricus bisporus, p. 92",
      summary: "Cappello, lamelle, anello/carne e habitat concimato descritti esplicitamente.",
    },
  ],
  "Cyclocybe cylindracea": [
    {
      sourceId: "S5-amint-laconi-sardegna-2009",
      sourceLocation: "scheda Agrocybe aegerita (= A. cylindracea), pp. 10-11",
      summary: "Evoluzione cromatica del cappello, lamelle, anello e crescita lignicola descritti esplicitamente.",
    },
  ],
  "Amanita gemmata": [
    {
      sourceId: "S5-amint-laconi-sardegna-2009",
      sourceLocation: "scheda Amanita gemmata, pp. 17-18",
      summary: "Velo pileico detersile, volva circoncisa, anello fugace e habitat descritti esplicitamente.",
    },
  ],
  "Galerina marginata group": [
    {
      sourceId: "S3-campania-funghi-2007",
      sourceLocation: "scheda Galerina marginata, p. 166",
      summary: "Igrofania, lamelle, velo/anello e crescita lignicola descritti esplicitamente.",
    },
  ],
  "Lentinula edodes": [
    {
      sourceId: "S4-veneto-funghi-spontanei-2012",
      sourceLocation: "sezione Lo Shii-take (Lentinula edodes), p. 14",
      summary: "Cappello squamuloso, lamelle adnate-uncinate, carne soda e gambo coriaceo descritti esplicitamente.",
    },
  ],
  "Volvariella volvacea": [
    {
      sourceId: "S3-campania-funghi-2007",
      sourceLocation: "scheda Volvariella volvacea, pp. 272-274",
      summary: "Cappello fibrilloso, lamelle rosa a maturità, grande volva e habitat termofilo descritti esplicitamente.",
    },
    {
      sourceId: "S4-veneto-funghi-spontanei-2012",
      sourceLocation: "sezione Il fungo del muschio (Volvariella volvacea), pp. 13-14",
      summary: "Stadio giovanile chiuso nella volva e aspetto del prodotto coltivato/commerciale confermati.",
    },
  ],
  "Stropharia rugosoannulata": [
    {
      sourceId: "S4-veneto-funghi-spontanei-2012",
      sourceLocation: "sezione La Strofaria (Stropharia rugosoannulata), p. 14",
      summary: "Criticità di raccolte spontanee su compost/pacciamature in siti potenzialmente contaminati documentata.",
    },
  ],
};

const internalAuditedFieldProfileEvidence: EvidenceRecord[] =
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

const sourceEnrichmentEvidence: EvidenceRecord[] = sourceMinimumLearningUnits.flatMap((unit) =>
  (sourceEnrichmentByLabel[unit.sourceLabel] ?? []).map((source, index) => ({
    evidenceId: `evidence-field-profile-source-${unit.id}-${index + 1}`,
    sourceId: source.sourceId,
    sourceLocation: source.sourceLocation,
    claimType: "morphology" as const,
    claimSummary: `Rafforzamento del profilo 3+1 di ${unit.sourceLabel}: ${source.summary}`,
    evidenceStrength: "primaryExplicit" as const,
    extractedBy: SOURCE_ENRICHMENT_REVIEWED_BY,
    extractedAt: SOURCE_ENRICHMENT_REVIEWED_AT,
    reviewedBy: SOURCE_ENRICHMENT_REVIEWED_BY,
    reviewedAt: SOURCE_ENRICHMENT_REVIEWED_AT,
    reviewStatus: "reviewed" as const,
    notes:
      "Nuova fonte utente integrata il 2026-09-29. La fonte supporta il contenuto morfologico/ecologico indicato; non sovrascrive autonomamente i gate separati di commestibilità o tossicità.",
  })),
);

export const auditedFieldProfileEvidence: EvidenceRecord[] = [
  ...internalAuditedFieldProfileEvidence,
  ...sourceEnrichmentEvidence,
];

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
      evidenceIds: [
        `evidence-field-profile-${unit.id}`,
        ...(sourceEnrichmentByLabel[unit.sourceLabel] ?? []).map(
          (_, index) => `evidence-field-profile-source-${unit.id}-${index + 1}`,
        ),
      ],
      reviewStatus: AUDITED_MINIMUM_FIELD_PROFILE_REVIEW_STATUS,
    };
  });
