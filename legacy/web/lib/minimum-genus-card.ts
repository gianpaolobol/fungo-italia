import type { EvidenceReviewStatus } from "./catalog-evidence.ts";
import type { MinimumGenusSourceRank } from "./minimum-genus-source.ts";

export type ProgressiveGenusLevel =
  | "essential"
  | "deepening"
  | "specialist";

export interface GenusEssentialLayer {
  objectiveSummary: string;
  terminology: string[];
  macroCharacters: string[];
  safetyFocus: string[];
  claimIds: string[];
}

export interface GenusDeepeningLayer {
  objectiveSummary: string | null;
  discriminatingCharacters: string[];
  taxonomyNotes: string[];
  claimIds: string[];
}

export interface GenusSpecialistLayer {
  objectiveSummary: string | null;
  specialistTopics: string[];
  claimIds: string[];
}

export interface MinimumGenusCard {
  cardId: string;
  teachingUnitId: string;
  sourceLabel: string;
  sourceRank: MinimumGenusSourceRank;
  sourcePage: number;
  displayTitle: string;
  sourceGenera: string[];
  currentGenera: string[];
  minimumChildCardIds: string[];
  essential: GenusEssentialLayer;
  deepening: GenusDeepeningLayer;
  specialist: GenusSpecialistLayer;
  reviewStatus: EvidenceReviewStatus;
}

export interface MinimumGenusCardValidation {
  ok: boolean;
  cardCount: number;
  errors: string[];
}

const placeholderPatterns = [
  /^todo$/i,
  /^tbd$/i,
  /^placeholder$/i,
  /^da completare$/i,
  /^n\/?a$/i,
];

function meaningful(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 &&
    !placeholderPatterns.some((pattern) => pattern.test(normalized));
}

function validateTextList(
  cardId: string,
  label: string,
  values: readonly string[],
  errors: string[],
  options: { required?: boolean } = {},
) {
  if (options.required !== false && values.length === 0) {
    errors.push(`${cardId}: ${label} is empty`);
  }
  if (values.some((value) => !meaningful(value))) {
    errors.push(`${cardId}: ${label} contains placeholder or empty text`);
  }
}

export function validateMinimumGenusCards(
  cards: readonly MinimumGenusCard[],
  options: {
    expectedCount?: number;
    requireEvidenceLinks?: boolean;
  } = {},
): MinimumGenusCardValidation {
  const expectedCount = options.expectedCount ?? 66;
  const requireEvidenceLinks = options.requireEvidenceLinks ?? true;
  const errors: string[] = [];

  if (cards.length !== expectedCount) {
    errors.push(`genus/group card count ${cards.length}; expected ${expectedCount}`);
  }

  const cardIds = new Set<string>();
  const teachingUnitIds = new Set<string>();

  for (const card of cards) {
    if (!meaningful(card.cardId)) errors.push("genus/group card with invalid id");
    if (cardIds.has(card.cardId)) errors.push(`duplicate genus/group card id: ${card.cardId}`);
    cardIds.add(card.cardId);

    if (!meaningful(card.teachingUnitId)) {
      errors.push(`${card.cardId}: missing teaching unit id`);
    }
    if (teachingUnitIds.has(card.teachingUnitId)) {
      errors.push(`duplicate teaching unit card: ${card.teachingUnitId}`);
    }
    teachingUnitIds.add(card.teachingUnitId);

    if (!meaningful(card.sourceLabel)) errors.push(`${card.cardId}: invalid source label`);
    if (!meaningful(card.displayTitle)) errors.push(`${card.cardId}: invalid display title`);
    if (!Number.isInteger(card.sourcePage) || card.sourcePage <= 0) {
      errors.push(`${card.cardId}: invalid source page`);
    }

    validateTextList(card.cardId, "sourceGenera", card.sourceGenera, errors);
    if (new Set(card.sourceGenera).size !== card.sourceGenera.length) {
      errors.push(`${card.cardId}: duplicate source genus`);
    }
    if (new Set(card.currentGenera).size !== card.currentGenera.length) {
      errors.push(`${card.cardId}: duplicate current genus`);
    }
    if (new Set(card.minimumChildCardIds).size !== card.minimumChildCardIds.length) {
      errors.push(`${card.cardId}: duplicate minimum child card id`);
    }

    if (!meaningful(card.essential.objectiveSummary)) {
      errors.push(`${card.cardId}: essential objective summary is required`);
    }
    validateTextList(card.cardId, "essential terminology", card.essential.terminology, errors);
    validateTextList(card.cardId, "essential macro characters", card.essential.macroCharacters, errors);
    validateTextList(card.cardId, "essential safety focus", card.essential.safetyFocus, errors, { required: false });

    if (card.deepening.objectiveSummary !== null &&
        !meaningful(card.deepening.objectiveSummary)) {
      errors.push(`${card.cardId}: invalid deepening objective summary`);
    }
    validateTextList(
      card.cardId,
      "deepening discriminating characters",
      card.deepening.discriminatingCharacters,
      errors,
      { required: false },
    );
    validateTextList(
      card.cardId,
      "deepening taxonomy notes",
      card.deepening.taxonomyNotes,
      errors,
      { required: false },
    );

    if (card.specialist.objectiveSummary !== null &&
        !meaningful(card.specialist.objectiveSummary)) {
      errors.push(`${card.cardId}: invalid specialist objective summary`);
    }
    validateTextList(
      card.cardId,
      "specialist topics",
      card.specialist.specialistTopics,
      errors,
      { required: false },
    );

    if (requireEvidenceLinks) {
      if (card.essential.claimIds.length === 0) {
        errors.push(`${card.cardId}: essential layer requires claim ids`);
      }
      if (
        card.deepening.objectiveSummary !== null &&
        card.deepening.claimIds.length === 0
      ) {
        errors.push(`${card.cardId}: deepening layer requires claim ids when present`);
      }
      if (
        card.specialist.objectiveSummary !== null &&
        card.specialist.claimIds.length === 0
      ) {
        errors.push(`${card.cardId}: specialist layer requires claim ids when present`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    cardCount: cards.length,
    errors,
  };
}
