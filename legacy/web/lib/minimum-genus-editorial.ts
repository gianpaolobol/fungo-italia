import type {
  CatalogClaimRecord,
  EvidenceRecord,
} from "./catalog-evidence.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import { minimumGenusSourceUnits } from "./minimum-genus-source.ts";

const EXTRACTED_AT = "2026-09-21T16:30:00Z";
const S1_SOURCE_ID = "S1-obiettivi-tassonomici-v4-2026-06-09";
const EDITORIAL_SOURCE_ID = "EDITORIAL-minimum-card-synthesis-v1";
const NOMENCLATURE_SOURCE_ID = "NOM-index-fungorum";

const sourceById = new Map(
  minimumGenusSourceUnits.map((entry) => [entry.id, entry]),
);

function evidence(
  evidenceId: string,
  sourceId: string,
  sourceLocation: string,
  claimType: EvidenceRecord["claimType"],
  claimSummary: string,
  evidenceStrength: EvidenceRecord["evidenceStrength"],
  reviewStatus: EvidenceRecord["reviewStatus"],
  notes: string | null,
): EvidenceRecord {
  return {
    evidenceId,
    sourceId,
    sourceLocation,
    claimType,
    claimSummary,
    evidenceStrength,
    extractedBy: "pipeline:progressive-genus-cards-v1",
    extractedAt: EXTRACTED_AT,
    reviewedBy: null,
    reviewedAt: null,
    reviewStatus,
    notes,
  };
}

export const minimumGenusCardEvidence: EvidenceRecord[] =
  minimumGenusCards.flatMap((card) => {
    const source = sourceById.get(card.teachingUnitId);
    if (!source) throw new Error(`Missing genus source for ${card.teachingUnitId}`);

    const records: EvidenceRecord[] = [
      evidence(
        `evidence-genus-training-minimum-${card.teachingUnitId}`,
        S1_SOURCE_ID,
        `pagina ${source.sourcePage}; livello Minimo; voce ${source.sourceLabel}`,
        "training",
        `S1 include ${source.sourceLabel} nel livello Minimo con rango didattico ${source.sourceRank}.`,
        "primaryExplicit",
        "normalized",
        "Sintesi originale del requisito didattico; non riproduce il testo esteso della fonte.",
      ),
      evidence(
        `evidence-genus-morphology-${card.teachingUnitId}`,
        EDITORIAL_SOURCE_ID,
        `sintesi editoriale Essenziale; unita ${card.teachingUnitId}`,
        "morphology",
        `Terminologia e caratteri macroscopici Essenziali per ${card.sourceLabel}.`,
        "uncertain",
        "reviewNeeded",
        "Contenuto editoriale da verificare durante la revisione micologica.",
      ),
      evidence(
        `evidence-genus-taxonomy-${card.teachingUnitId}`,
        NOMENCLATURE_SOURCE_ID,
        `generi correnti derivati dai mapping verificati dei taxa figli di ${card.teachingUnitId}`,
        "taxonomy",
        card.currentGenera.length > 0
          ? `I taxa figli verificati ricadono nei generi correnti: ${card.currentGenera.join(", ")}.`
          : `Nessun genere corrente viene inferito automaticamente per ${card.sourceLabel}; resta il nome didattico S1.`,
        card.currentGenera.length > 0 ? "primaryInferred" : "uncertain",
        card.currentGenera.length > 0 ? "normalized" : "reviewNeeded",
        card.currentGenera.length > 0
          ? "Derivazione dal mapping nomenclaturale dei taxa figli gia verificato dalla CI."
          : "La nomenclatura del solo genere richiede verifica dedicata prima di essere marcata corrente.",
      ),
    ];

    if (source.desirableObjective !== null) {
      records.push(
        evidence(
          `evidence-genus-training-desirable-${card.teachingUnitId}`,
          S1_SOURCE_ID,
          `pagina ${source.sourcePage}; livello Auspicabile; voce ${source.sourceLabel}`,
          "training",
          `S1 prevede un livello Auspicabile per ${source.sourceLabel}.`,
          "primaryExplicit",
          "normalized",
          "Sintesi originale del livello Auspicabile.",
        ),
        evidence(
          `evidence-genus-deepening-editorial-${card.teachingUnitId}`,
          EDITORIAL_SOURCE_ID,
          `sintesi editoriale Approfondimento; unita ${card.teachingUnitId}`,
          "morphology",
          `Caratteri discriminanti proposti per il livello Approfondimento di ${card.sourceLabel}.`,
          "uncertain",
          "reviewNeeded",
          "Da verificare durante la revisione micologica.",
        ),
      );
    }

    if (source.advancedObjective !== null) {
      records.push(
        evidence(
          `evidence-genus-training-advanced-${card.teachingUnitId}`,
          S1_SOURCE_ID,
          `pagina ${source.sourcePage}; Approfondimenti; voce ${source.sourceLabel}`,
          "training",
          `S1 prevede approfondimenti specialistici per ${source.sourceLabel}.`,
          "primaryExplicit",
          "normalized",
          "Sintesi originale del livello specialistico.",
        ),
        evidence(
          `evidence-genus-specialist-editorial-${card.teachingUnitId}`,
          EDITORIAL_SOURCE_ID,
          `sintesi editoriale Specialistico; unita ${card.teachingUnitId}`,
          "morphology",
          `Temi specialistici proposti per ${card.sourceLabel}.`,
          "uncertain",
          "reviewNeeded",
          "Microscopia, variabilita e delimitazione tassonomica da revisionare prima dell'approvazione.",
        ),
      );
    }

    return records;
  });

export const minimumGenusCardClaims: CatalogClaimRecord[] =
  minimumGenusCards.flatMap((card) => {
    const source = sourceById.get(card.teachingUnitId);
    if (!source) throw new Error(`Missing genus source for ${card.teachingUnitId}`);

    const claims: CatalogClaimRecord[] = [
      {
        claimId: `claim-genus-training-minimum-${card.teachingUnitId}`,
        subjectType: "genusTeachingUnit",
        subjectId: card.teachingUnitId,
        fieldPath: "genusCard.essential.objective",
        claimType: "training",
        valueJson: JSON.stringify({
          level: "minimum",
          sourceLabel: card.sourceLabel,
          sourceRank: card.sourceRank,
          objectiveSummary: card.essential.objectiveSummary,
        }),
        evidenceIds: [`evidence-genus-training-minimum-${card.teachingUnitId}`],
        reviewStatus: "normalized",
      },
      {
        claimId: `claim-genus-morphology-${card.teachingUnitId}`,
        subjectType: "genusTeachingUnit",
        subjectId: card.teachingUnitId,
        fieldPath: "genusCard.essential.morphology",
        claimType: "morphology",
        valueJson: JSON.stringify({
          terminology: card.essential.terminology,
          macroCharacters: card.essential.macroCharacters,
          safetyFocus: card.essential.safetyFocus,
        }),
        evidenceIds: [`evidence-genus-morphology-${card.teachingUnitId}`],
        reviewStatus: "reviewNeeded",
      },
      {
        claimId: `claim-genus-taxonomy-${card.teachingUnitId}`,
        subjectType: "genusTeachingUnit",
        subjectId: card.teachingUnitId,
        fieldPath: "genusCard.taxonomy",
        claimType: "taxonomy",
        valueJson: JSON.stringify({
          sourceGenera: card.sourceGenera,
          currentGenera: card.currentGenera,
        }),
        evidenceIds: [`evidence-genus-taxonomy-${card.teachingUnitId}`],
        reviewStatus: card.currentGenera.length > 0 ? "normalized" : "reviewNeeded",
      },
    ];

    if (source.desirableObjective !== null) {
      claims.push(
        {
          claimId: `claim-genus-training-desirable-${card.teachingUnitId}`,
          subjectType: "genusTeachingUnit",
          subjectId: card.teachingUnitId,
          fieldPath: "genusCard.deepening.objective",
          claimType: "training",
          valueJson: JSON.stringify({
            level: "desirable",
            objectiveSummary: card.deepening.objectiveSummary,
          }),
          evidenceIds: [`evidence-genus-training-desirable-${card.teachingUnitId}`],
          reviewStatus: "normalized",
        },
        {
          claimId: `claim-genus-deepening-editorial-${card.teachingUnitId}`,
          subjectType: "genusTeachingUnit",
          subjectId: card.teachingUnitId,
          fieldPath: "genusCard.deepening.characters",
          claimType: "morphology",
          valueJson: JSON.stringify({
            discriminatingCharacters: card.deepening.discriminatingCharacters,
          }),
          evidenceIds: [`evidence-genus-deepening-editorial-${card.teachingUnitId}`],
          reviewStatus: "reviewNeeded",
        },
      );
    }

    if (source.advancedObjective !== null) {
      claims.push(
        {
          claimId: `claim-genus-training-advanced-${card.teachingUnitId}`,
          subjectType: "genusTeachingUnit",
          subjectId: card.teachingUnitId,
          fieldPath: "genusCard.specialist.objective",
          claimType: "training",
          valueJson: JSON.stringify({
            level: "advanced",
            objectiveSummary: card.specialist.objectiveSummary,
          }),
          evidenceIds: [`evidence-genus-training-advanced-${card.teachingUnitId}`],
          reviewStatus: "normalized",
        },
        {
          claimId: `claim-genus-specialist-editorial-${card.teachingUnitId}`,
          subjectType: "genusTeachingUnit",
          subjectId: card.teachingUnitId,
          fieldPath: "genusCard.specialist.topics",
          claimType: "morphology",
          valueJson: JSON.stringify({
            specialistTopics: card.specialist.specialistTopics,
          }),
          evidenceIds: [`evidence-genus-specialist-editorial-${card.teachingUnitId}`],
          reviewStatus: "reviewNeeded",
        },
      );
    }

    return claims;
  });
