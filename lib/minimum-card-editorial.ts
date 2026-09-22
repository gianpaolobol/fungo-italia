import objectives from "../data/taxonomic-objectives.json" with { type: "json" };

import type {
  CatalogClaimRecord,
  EvidenceRecord,
} from "./catalog-evidence.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import {
  draftConfusionsForSourceLabel,
  genusFromSourceLabel,
  profileForSourceLabel,
} from "./minimum-card-content.ts";
import { provisionalSafetyForSourceLabel } from "./minimum-card-safety.ts";

const EXTRACTED_AT = "2026-09-21T15:30:00Z";
const EDITORIAL_SOURCE_ID = "EDITORIAL-minimum-card-synthesis-v1";
const S2_SOURCE_ID = "S2-guida-ragionata-commestibilita-2021";

type ObjectiveRecord = (typeof objectives)[number];

const objectiveById = new Map(
  (objectives as ObjectiveRecord[]).map((entry) => [entry.id, entry]),
);

function editorialEvidence(
  id: string,
  claimType: EvidenceRecord["claimType"],
  sourceLocation: string,
  summary: string,
): EvidenceRecord {
  return {
    evidenceId: id,
    sourceId: EDITORIAL_SOURCE_ID,
    sourceLocation,
    claimType,
    claimSummary: summary,
    evidenceStrength: "uncertain",
    extractedBy: "editorial-synthesis:minimum-cards-v1",
    extractedAt: EXTRACTED_AT,
    reviewedBy: null,
    reviewedAt: null,
    reviewStatus: "reviewNeeded",
    notes: "Sintesi editoriale da sottoporre a revisione micologica prima dell'approvazione.",
  };
}

export const minimumCardDraftEvidence: EvidenceRecord[] =
  sourceMinimumLearningUnits.flatMap((unit) => {
    const profile = profileForSourceLabel(unit.sourceLabel);
    const genus = genusFromSourceLabel(unit.sourceLabel) || "gruppo";
    const objective = objectiveById.get(unit.sourceHeadingId);
    const safety = provisionalSafetyForSourceLabel(unit.sourceLabel);
    const s2Page = objective?.sources.edibilityGuide.page ?? null;

    const records: EvidenceRecord[] = [
      editorialEvidence(
        `evidence-morphology-${unit.id}`,
        "morphology",
        `profilo editoriale ${genus}; unita ${unit.id}`,
        `Sintesi dei caratteri macroscopici essenziali per ${unit.sourceLabel} al livello didattico Minimo.`,
      ),
      editorialEvidence(
        `evidence-ecology-${unit.id}`,
        "ecology",
        `profilo editoriale ${genus}; unita ${unit.id}`,
        `Sintesi ecologica di base per ${unit.sourceLabel}: ${profile.ecology}`,
      ),
    ];

    if (s2Page) {
      records.push({
        evidenceId: `evidence-edibility-draft-${unit.id}`,
        sourceId: S2_SOURCE_ID,
        sourceLocation: `pagina ${s2Page}; voce collegata a ${objective?.scientificName ?? unit.sourceLabel}`,
        claimType: "edibility",
        claimSummary:
          `Crosswalk provvisorio verso la categoria ${safety.category}; richiede verifica puntuale del testo S2 prima dell'approvazione.`,
        evidenceStrength: "primaryInferred",
        extractedBy: "pipeline:s1-s2-crosswalk-v1",
        extractedAt: EXTRACTED_AT,
        reviewedBy: null,
        reviewedAt: null,
        reviewStatus: "reviewNeeded",
        notes:
          "La pagina S2 e documentata nel registro sorgente, ma la categoria resta reviewNeeded finche un revisore non conferma il passaggio testuale.",
      });
    }

    for (const [index, confusion] of draftConfusionsForSourceLabel(unit.sourceLabel).entries()) {
      records.push(
        editorialEvidence(
          `evidence-confusion-${unit.id}-${index + 1}`,
          "confusion",
          `profilo di confusione editoriale; unita ${unit.id}`,
          `Possibile confusione di ${unit.sourceLabel} con ${confusion.with}; rischio ${confusion.risk}.`,
        ),
      );
    }

    return records;
  });

export const minimumCardDraftClaims: CatalogClaimRecord[] =
  sourceMinimumLearningUnits.flatMap((unit) => {
    const profile = profileForSourceLabel(unit.sourceLabel);
    const safety = provisionalSafetyForSourceLabel(unit.sourceLabel);
    const objective = objectiveById.get(unit.sourceHeadingId);
    const claims: CatalogClaimRecord[] = [
      {
        claimId: `claim-morphology-${unit.id}`,
        subjectType: "learningUnit",
        subjectId: unit.id,
        fieldPath: "card.minimum.morphology",
        claimType: "morphology",
        valueJson: JSON.stringify({
          terminology: profile.terminology,
          essentialMorphology: profile.morphology,
        }),
        evidenceIds: [`evidence-morphology-${unit.id}`],
        reviewStatus: "reviewNeeded",
      },
      {
        claimId: `claim-ecology-${unit.id}`,
        subjectType: "learningUnit",
        subjectId: unit.id,
        fieldPath: "card.minimum.ecology",
        claimType: "ecology",
        valueJson: JSON.stringify({ ecologySummary: profile.ecology }),
        evidenceIds: [`evidence-ecology-${unit.id}`],
        reviewStatus: "reviewNeeded",
      },
    ];

    if (objective?.sources.edibilityGuide.page) {
      claims.push({
        claimId: `claim-edibility-draft-${unit.id}`,
        subjectType: "learningUnit",
        subjectId: unit.id,
        fieldPath: "card.minimum.edibility",
        claimType: "edibility",
        valueJson: JSON.stringify({
          category: safety.category,
          treatmentCodes: safety.treatmentCodes,
          provisional: true,
        }),
        evidenceIds: [`evidence-edibility-draft-${unit.id}`],
        reviewStatus: "reviewNeeded",
      });
    }

    for (const [index, confusion] of draftConfusionsForSourceLabel(unit.sourceLabel).entries()) {
      claims.push({
        claimId: `claim-confusion-${unit.id}-${index + 1}`,
        subjectType: "learningUnit",
        subjectId: unit.id,
        fieldPath: `card.minimum.confusions.${index}`,
        claimType: "confusion",
        valueJson: JSON.stringify(confusion),
        evidenceIds: [`evidence-confusion-${unit.id}-${index + 1}`],
        reviewStatus: "reviewNeeded",
      });
    }

    return claims;
  });
