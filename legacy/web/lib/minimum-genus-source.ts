import objectives from "../data/taxonomic-objectives.json" with { type: "json" };

export type MinimumGenusSourceRank = "genus" | "operationalGroup";

export interface MinimumGenusSourceUnit {
  id: string;
  sourceLabel: string;
  sourceRank: MinimumGenusSourceRank;
  sourcePage: number;
  minimumObjective: string;
  desirableObjective: string | null;
  advancedObjective: string | null;
}

export const minimumGenusSourceUnits: MinimumGenusSourceUnit[] = objectives
  .filter(
    (entry) =>
      Boolean(entry.objectives.minimum) &&
      (entry.rank === "genus" || entry.rank === "operationalGroup"),
  )
  .map((entry) => ({
    id: `genus-source-${entry.id.replace(/^objective-/, "")}`,
    sourceLabel: entry.scientificName,
    sourceRank: entry.rank as MinimumGenusSourceRank,
    sourcePage: entry.sources.minimumObjectives.page,
    minimumObjective: entry.objectives.minimum as string,
    desirableObjective: entry.objectives.desirable,
    advancedObjective: entry.objectives.advanced,
  }));

export const MINIMUM_GENUS_SOURCE_TARGET = 66;

if (minimumGenusSourceUnits.length !== MINIMUM_GENUS_SOURCE_TARGET) {
  throw new Error(
    `Minimum genus/group source inventory has ${minimumGenusSourceUnits.length} records; expected ${MINIMUM_GENUS_SOURCE_TARGET}`,
  );
}
