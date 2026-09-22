import type { TaxonRank } from "./domain.ts";
import type { EvidenceReviewStatus } from "./catalog-evidence.ts";

export type CardDepth = "minimum";
export type EdibilityCategory =
  | "EDIBLE"
  | "EDIBLE_AFTER_TREATMENT"
  | "DISCOURAGED"
  | "NO_FOOD_VALUE"
  | "NOT_EDIBLE"
  | "POISONOUS"
  | "NOT_ASSESSED";

export type ConfusionRisk = "low" | "moderate" | "high" | "deadly";

export interface MinimumCardConfusion {
  with: string;
  context: string;
  discriminatingCharacters: string[];
  risk: ConfusionRisk;
  claimIds: string[];
}

export interface MinimumAtlasCard {
  cardId: string;
  learningUnitId: string;
  depth: CardDepth;
  displayName: string;
  sourceLabel: string;
  rank: TaxonRank;
  currentAcceptedNames: string[];
  terminology: string[];
  essentialMorphology: string[];
  ecologySummary: string | null;
  confusionWarnings: MinimumCardConfusion[];
  edibilityCategory: EdibilityCategory;
  treatmentCodes: string[];
  safetySummary: string;
  claimIds: string[];
  reviewStatus: EvidenceReviewStatus;
}

export interface MinimumCardValidation {
  ok: boolean;
  cardCount: number;
  errors: string[];
}

const placeholderPatterns = [
  /^da completare$/i,
  /^todo$/i,
  /^tbd$/i,
  /^placeholder$/i,
  /^n\/?a$/i,
];

function nonPlaceholder(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 && !placeholderPatterns.some((pattern) => pattern.test(normalized));
}

export function validateMinimumCards(
  cards: readonly MinimumAtlasCard[],
  options: {
    expectedCount?: number;
    requireCompleteContent?: boolean;
  } = {},
): MinimumCardValidation {
  const expectedCount = options.expectedCount ?? 148;
  const requireCompleteContent = options.requireCompleteContent ?? true;
  const errors: string[] = [];
  const ids = new Set<string>();
  const unitIds = new Set<string>();

  if (cards.length !== expectedCount) {
    errors.push(`card count ${cards.length}; expected ${expectedCount}`);
  }

  for (const card of cards) {
    if (!card.cardId.trim()) errors.push("card with empty id");
    if (ids.has(card.cardId)) errors.push(`duplicate card id: ${card.cardId}`);
    ids.add(card.cardId);

    if (!card.learningUnitId.trim()) errors.push(`${card.cardId}: missing learning unit id`);
    if (unitIds.has(card.learningUnitId)) errors.push(`duplicate learning unit card: ${card.learningUnitId}`);
    unitIds.add(card.learningUnitId);

    if (!nonPlaceholder(card.displayName)) errors.push(`${card.cardId}: invalid display name`);
    if (!nonPlaceholder(card.sourceLabel)) errors.push(`${card.cardId}: invalid source label`);

    if (requireCompleteContent) {
      if (card.terminology.length === 0 || card.terminology.some((value) => !nonPlaceholder(value))) {
        errors.push(`${card.cardId}: terminology is incomplete`);
      }
      if (
        card.essentialMorphology.length === 0 ||
        card.essentialMorphology.some((value) => !nonPlaceholder(value))
      ) {
        errors.push(`${card.cardId}: essential morphology is incomplete`);
      }
      if (!card.ecologySummary || !nonPlaceholder(card.ecologySummary)) {
        errors.push(`${card.cardId}: ecology summary is incomplete`);
      }
      if (!nonPlaceholder(card.safetySummary)) {
        errors.push(`${card.cardId}: safety summary is incomplete`);
      }
    }

    if (card.claimIds.length === 0) {
      errors.push(`${card.cardId}: no claims linked`);
    }

    if (card.edibilityCategory === "EDIBLE_AFTER_TREATMENT" && card.treatmentCodes.length === 0) {
      errors.push(`${card.cardId}: conditional edibility requires treatment codes`);
    }

    for (const confusion of card.confusionWarnings) {
      if (!nonPlaceholder(confusion.with)) errors.push(`${card.cardId}: confusion target missing`);
      if (!nonPlaceholder(confusion.context)) errors.push(`${card.cardId}: confusion context missing`);
      if (confusion.discriminatingCharacters.length === 0) {
        errors.push(`${card.cardId}: confusion requires discriminating characters`);
      }
      if (confusion.claimIds.length === 0) {
        errors.push(`${card.cardId}: confusion requires claim ids`);
      }
      if (confusion.risk === "deadly" && confusion.discriminatingCharacters.length < 2) {
        errors.push(`${card.cardId}: deadly confusion requires at least two discriminating characters`);
      }
    }
  }

  return { ok: errors.length === 0, cardCount: cards.length, errors };
}
