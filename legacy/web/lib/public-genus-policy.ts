import type { EvidenceReviewStatus } from "./catalog-evidence.ts";
import type { MinimumGenusCard } from "./minimum-genus-card.ts";

export interface PublicGenusLayer {
  objectiveSummary: string | null;
  bullets: string[];
  taxonomyNotes: string[];
  safetyFocus: string[];
  pendingScientificContent: boolean;
}

export function publicGenusLayer(
  card: MinimumGenusCard,
  depth: "essential" | "deepening" | "specialist",
): PublicGenusLayer {
  const reviewed = card.reviewStatus === "reviewed" || card.reviewStatus === "approved";

  if (depth === "essential") {
    return {
      objectiveSummary: card.essential.objectiveSummary,
      bullets: reviewed
        ? [...card.essential.terminology, ...card.essential.macroCharacters]
        : [],
      taxonomyNotes: [],
      safetyFocus: card.reviewStatus === "approved"
        ? [...card.essential.safetyFocus]
        : [],
      pendingScientificContent: !reviewed,
    };
  }

  if (depth === "deepening") {
    return {
      objectiveSummary: card.deepening.objectiveSummary,
      bullets: reviewed ? [...card.deepening.discriminatingCharacters] : [],
      taxonomyNotes: reviewed ? [...card.deepening.taxonomyNotes] : [],
      safetyFocus: [],
      pendingScientificContent: !reviewed && card.deepening.objectiveSummary !== null,
    };
  }

  return {
    objectiveSummary: card.specialist.objectiveSummary,
    bullets: reviewed ? [...card.specialist.specialistTopics] : [],
    taxonomyNotes: [],
    safetyFocus: [],
    pendingScientificContent: !reviewed && card.specialist.objectiveSummary !== null,
  };
}

export function genusCardHasPublicScientificLeak(
  card: MinimumGenusCard,
): boolean {
  if (card.reviewStatus === "reviewed" || card.reviewStatus === "approved") {
    return false;
  }

  const essential = publicGenusLayer(card, "essential");
  const deepening = publicGenusLayer(card, "deepening");
  const specialist = publicGenusLayer(card, "specialist");

  return (
    essential.bullets.length > 0 ||
    essential.safetyFocus.length > 0 ||
    deepening.bullets.length > 0 ||
    deepening.taxonomyNotes.length > 0 ||
    specialist.bullets.length > 0
  );
}

export function isPublicReviewStatusSafe(status: EvidenceReviewStatus) {
  return status === "reviewed" || status === "approved" || status === "reviewNeeded";
}
