import objectives from "../data/taxonomic-objectives.json" with { type: "json" };

import { minimumCards } from "./minimum-cards.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import { minimumNomenclatureMappings } from "./minimum-nomenclature.ts";

export type MinimumNavigationRouteKind =
  | "teachingCard"
  | "currentGenus"
  | "sourceHeading";

export interface MinimumNavigationRoute {
  kind: MinimumNavigationRouteKind;
  target: string;
}

export interface MinimumCardNavigationEntry {
  cardId: string;
  learningUnitId: string;
  sourceLabel: string;
  sourceHeadingId: string;
  sourceHeadingLabel: string;
  sourceHeadingRank: string;
  teachingCardId: string | null;
  currentGenera: string[];
  primaryRoute: MinimumNavigationRoute;
}

export interface CurrentGenusIndexEntry {
  genus: string;
  minimumCardIds: string[];
  teachingCardIds: string[];
  sourceLabels: string[];
}


export type GenusNameIndexKind = "sourceGenus" | "currentGenus";

export interface GenusNameIndexEntry {
  name: string;
  kinds: GenusNameIndexKind[];
  teachingCardIds: string[];
  minimumCardIds: string[];
}

export interface SourceHeadingIndexEntry {
  sourceHeadingId: string;
  sourceHeadingLabel: string;
  sourceHeadingRank: string;
  minimumCardIds: string[];
}

const objectiveById = new Map(
  objectives.map((entry) => [entry.id, entry]),
);

const minimumCardByLearningUnit = new Map(
  minimumCards.map((card) => [card.learningUnitId, card]),
);

const nomenclatureByLearningUnit = new Map(
  minimumNomenclatureMappings.map((mapping) => [mapping.sourceUnitId, mapping]),
);

const teachingCardBySourceHeading = new Map<string, string>();
for (const card of minimumGenusCards) {
  const sourceHeadingId = `objective-${card.teachingUnitId.replace(/^genus-source-/, "")}`;
  teachingCardBySourceHeading.set(sourceHeadingId, card.cardId);
}

function genusFromAcceptedName(name: string) {
  return name.match(/^([A-Z][A-Za-z-]+)/)?.[1] ?? null;
}

function currentGeneraForLearningUnit(learningUnitId: string) {
  const mapping = nomenclatureByLearningUnit.get(learningUnitId);
  if (!mapping) {
    throw new Error(`Missing nomenclature mapping for ${learningUnitId}`);
  }
  return [...new Set(
    mapping.currentAcceptedNames
      .map(genusFromAcceptedName)
      .filter((value): value is string => Boolean(value)),
  )].sort((a, b) => a.localeCompare(b, "it"));
}

function routeFor(
  teachingCardId: string | null,
  currentGenera: readonly string[],
  sourceHeadingId: string,
): MinimumNavigationRoute {
  if (teachingCardId) {
    return { kind: "teachingCard", target: teachingCardId };
  }
  if (currentGenera.length === 1) {
    return { kind: "currentGenus", target: currentGenera[0] };
  }
  return { kind: "sourceHeading", target: sourceHeadingId };
}

export const minimumCardNavigation: MinimumCardNavigationEntry[] =
  sourceMinimumLearningUnits.map((unit) => {
    const card = minimumCardByLearningUnit.get(unit.id);
    if (!card) throw new Error(`Missing minimum card for ${unit.id}`);

    const heading = objectiveById.get(unit.sourceHeadingId);
    if (!heading) throw new Error(`Missing source heading ${unit.sourceHeadingId}`);

    const teachingCardId = teachingCardBySourceHeading.get(unit.sourceHeadingId) ?? null;
    const currentGenera = currentGeneraForLearningUnit(unit.id);

    return {
      cardId: card.cardId,
      learningUnitId: unit.id,
      sourceLabel: unit.sourceLabel,
      sourceHeadingId: unit.sourceHeadingId,
      sourceHeadingLabel: heading.scientificName,
      sourceHeadingRank: heading.rank,
      teachingCardId,
      currentGenera,
      primaryRoute: routeFor(
        teachingCardId,
        currentGenera,
        unit.sourceHeadingId,
      ),
    };
  });

export const currentGenusIndex: CurrentGenusIndexEntry[] = (() => {
  const byGenus = new Map<string, {
    minimumCardIds: Set<string>;
    teachingCardIds: Set<string>;
    sourceLabels: Set<string>;
  }>();

  for (const entry of minimumCardNavigation) {
    for (const genus of entry.currentGenera) {
      const bucket = byGenus.get(genus) ?? {
        minimumCardIds: new Set<string>(),
        teachingCardIds: new Set<string>(),
        sourceLabels: new Set<string>(),
      };
      bucket.minimumCardIds.add(entry.cardId);
      if (entry.teachingCardId) bucket.teachingCardIds.add(entry.teachingCardId);
      bucket.sourceLabels.add(entry.sourceLabel);
      byGenus.set(genus, bucket);
    }
  }

  return [...byGenus.entries()]
    .map(([genus, values]) => ({
      genus,
      minimumCardIds: [...values.minimumCardIds].sort(),
      teachingCardIds: [...values.teachingCardIds].sort(),
      sourceLabels: [...values.sourceLabels].sort((a, b) => a.localeCompare(b, "it")),
    }))
    .sort((a, b) => a.genus.localeCompare(b.genus, "it"));
})();

export const sourceHeadingIndex: SourceHeadingIndexEntry[] = (() => {
  const byHeading = new Map<string, SourceHeadingIndexEntry>();

  for (const entry of minimumCardNavigation) {
    const existing = byHeading.get(entry.sourceHeadingId);
    if (existing) {
      existing.minimumCardIds.push(entry.cardId);
      continue;
    }
    byHeading.set(entry.sourceHeadingId, {
      sourceHeadingId: entry.sourceHeadingId,
      sourceHeadingLabel: entry.sourceHeadingLabel,
      sourceHeadingRank: entry.sourceHeadingRank,
      minimumCardIds: [entry.cardId],
    });
  }

  return [...byHeading.values()]
    .map((entry) => ({
      ...entry,
      minimumCardIds: [...entry.minimumCardIds].sort(),
    }))
    .sort((a, b) => a.sourceHeadingLabel.localeCompare(b.sourceHeadingLabel, "it"));
})();


export const genusNameIndex: GenusNameIndexEntry[] = (() => {
  const buckets = new Map<string, {
    displayName: string;
    kinds: Set<GenusNameIndexKind>;
    teachingCardIds: Set<string>;
    minimumCardIds: Set<string>;
  }>();

  function add(
    name: string,
    kind: GenusNameIndexKind,
    teachingCardIds: readonly string[],
    minimumCardIds: readonly string[],
  ) {
    const key = name.toLocaleLowerCase("it").trim();
    if (!key) return;
    const bucket = buckets.get(key) ?? {
      displayName: name,
      kinds: new Set<GenusNameIndexKind>(),
      teachingCardIds: new Set<string>(),
      minimumCardIds: new Set<string>(),
    };
    bucket.kinds.add(kind);
    for (const id of teachingCardIds) bucket.teachingCardIds.add(id);
    for (const id of minimumCardIds) bucket.minimumCardIds.add(id);
    buckets.set(key, bucket);
  }

  for (const card of minimumGenusCards) {
    for (const sourceGenus of card.sourceGenera) {
      add(
        sourceGenus,
        "sourceGenus",
        [card.cardId],
        card.minimumChildCardIds,
      );
    }
  }

  for (const current of currentGenusIndex) {
    add(
      current.genus,
      "currentGenus",
      current.teachingCardIds,
      current.minimumCardIds,
    );
  }

  return [...buckets.values()]
    .map((bucket) => ({
      name: bucket.displayName,
      kinds: [...bucket.kinds].sort(),
      teachingCardIds: [...bucket.teachingCardIds].sort(),
      minimumCardIds: [...bucket.minimumCardIds].sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "it"));
})();
