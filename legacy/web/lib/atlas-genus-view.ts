import type { AtlasDepth } from "./atlas-navigation-state.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import type { MinimumGenusCard } from "./minimum-genus-card.ts";

export interface GenusCardViewModel {
  cardId: string;
  teachingUnitId: string;
  sourceLabel: string;
  sourceRank: MinimumGenusCard["sourceRank"];
  sourcePage: number;
  displayTitle: string;
  sourceGenera: string[];
  currentGenera: string[];
  minimumChildCardIds: string[];
  depth: AtlasDepth;
  sectionTitle: "Essenziale" | "Approfondimento" | "Specialistico";
  objectiveSummary: string | null;
  bullets: string[];
  taxonomyNotes: string[];
  safetyFocus: string[];
  claimIds: string[];
  reviewStatus: MinimumGenusCard["reviewStatus"];
}

function layerForDepth(card: MinimumGenusCard, depth: AtlasDepth) {
  if (depth === "deepening") {
    return {
      sectionTitle: "Approfondimento" as const,
      objectiveSummary: card.deepening.objectiveSummary,
      bullets: [...card.deepening.discriminatingCharacters],
      taxonomyNotes: [...card.deepening.taxonomyNotes],
      safetyFocus: [] as string[],
      claimIds: [...card.deepening.claimIds],
    };
  }
  if (depth === "specialist") {
    return {
      sectionTitle: "Specialistico" as const,
      objectiveSummary: card.specialist.objectiveSummary,
      bullets: [...card.specialist.specialistTopics],
      taxonomyNotes: [] as string[],
      safetyFocus: [] as string[],
      claimIds: [...card.specialist.claimIds],
    };
  }
  return {
    sectionTitle: "Essenziale" as const,
    objectiveSummary: card.essential.objectiveSummary,
    bullets: [
      ...card.essential.terminology,
      ...card.essential.macroCharacters,
    ],
    taxonomyNotes: [] as string[],
    safetyFocus: [...card.essential.safetyFocus],
    claimIds: [...card.essential.claimIds],
  };
}

export function genusCardViewModel(
  card: MinimumGenusCard,
  depth: AtlasDepth,
): GenusCardViewModel {
  const layer = layerForDepth(card, depth);
  return {
    cardId: card.cardId,
    teachingUnitId: card.teachingUnitId,
    sourceLabel: card.sourceLabel,
    sourceRank: card.sourceRank,
    sourcePage: card.sourcePage,
    displayTitle: card.displayTitle,
    sourceGenera: [...card.sourceGenera],
    currentGenera: [...card.currentGenera],
    minimumChildCardIds: [...card.minimumChildCardIds],
    depth,
    ...layer,
    reviewStatus: card.reviewStatus,
  };
}

export function findGenusCardViewModel(
  cardId: string,
  depth: AtlasDepth,
): GenusCardViewModel | null {
  const card = minimumGenusCards.find((entry) => entry.cardId === cardId);
  return card ? genusCardViewModel(card, depth) : null;
}

export function availableGenusDepths(card: MinimumGenusCard): AtlasDepth[] {
  const result: AtlasDepth[] = ["essential"];
  if (card.deepening.objectiveSummary !== null) result.push("deepening");
  if (card.specialist.objectiveSummary !== null) result.push("specialist");
  return result;
}
