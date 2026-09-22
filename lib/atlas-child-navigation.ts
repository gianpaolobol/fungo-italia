import {
  selectAtlasCard,
  type AtlasNavigationState,
} from "./atlas-navigation-state.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import { minimumCards } from "./minimum-cards.ts";

const genusCardById = new Map(
  minimumGenusCards.map((card) => [card.cardId, card]),
);

const minimumCardById = new Map(
  minimumCards.map((card) => [card.cardId, card]),
);

export interface ChildNavigationResult {
  ok: boolean;
  state: AtlasNavigationState;
  error: string | null;
}

export function selectMinimumChildFromTeachingGroup(
  state: AtlasNavigationState,
  teachingGroupCardId: string,
  minimumChildCardId: string,
): ChildNavigationResult {
  const group = genusCardById.get(teachingGroupCardId);
  if (!group) {
    return {
      ok: false,
      state,
      error: `Unknown teaching group card: ${teachingGroupCardId}`,
    };
  }

  if (!group.minimumChildCardIds.includes(minimumChildCardId)) {
    return {
      ok: false,
      state,
      error: `${minimumChildCardId} is not a child of ${teachingGroupCardId}`,
    };
  }

  if (!minimumCardById.has(minimumChildCardId)) {
    return {
      ok: false,
      state,
      error: `Unknown minimum child card: ${minimumChildCardId}`,
    };
  }

  return {
    ok: true,
    state: selectAtlasCard(state, {
      kind: "minimumTaxon",
      id: minimumChildCardId,
      depth: "essential",
      returnToCurrent: true,
    }),
    error: null,
  };
}

export function childCardsForTeachingGroup(teachingGroupCardId: string) {
  const group = genusCardById.get(teachingGroupCardId);
  if (!group) return [];

  return group.minimumChildCardIds
    .map((cardId) => minimumCardById.get(cardId))
    .filter((card): card is NonNullable<typeof card> => Boolean(card));
}
