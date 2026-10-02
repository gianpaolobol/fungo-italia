import {
  minimumGenusSourceUnits,
  type MinimumGenusSourceUnit,
} from "./minimum-genus-source.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import { minimumNomenclatureMappings } from "./minimum-nomenclature.ts";

export type MinimumGenusMappingStatus = "childMapped" | "sourceOnly";

export interface MinimumGenusTeachingMap {
  teachingUnitId: string;
  sourceLabel: string;
  sourceRank: MinimumGenusSourceUnit["sourceRank"];
  sourcePage: number;
  sourceGenera: string[];
  currentChildGenera: string[];
  childLearningUnitIds: string[];
  status: MinimumGenusMappingStatus;
}

const descriptorWords = new Set([
  "Collybioidi",
  "Marasmioidi",
  "Lepiotoidi",
]);

const sourceGenusOverrides = new Map<string, string[]>([
  [
    "Collybioidi e Marasmioidi (Collybia s.l. inclusi Dendrocollybia, Gymnopus, Rhodocollybia, più Strobilurus e Marasmius).",
    ["Collybia", "Marasmius"],
  ],
  [
    "Lepiotoidi: Lepiota (inclusi Chamaemyces, Cystolepiota, Pulverolepiota), Echinoderma, Leucoagaricus, Macrolepiota, Chlorophyllum, Leucocoprinus.",
    ["Lepiota", "Echinoderma", "Leucoagaricus", "Macrolepiota", "Chlorophyllum", "Leucocoprinus"],
  ],
]);

export function sourceGeneraForTeachingLabel(label: string): string[] {
  const override = sourceGenusOverrides.get(label);
  if (override) return [...override];

  const prefix = label.split("(")[0].replace(/[.:]+$/, "").trim();
  const genera = [...prefix.matchAll(/\b[A-Z][a-z]{2,}\b/g)]
    .map((match) => match[0])
    .filter((name) => !descriptorWords.has(name));

  return [...new Set(genera)];
}

function genusFromCurrentName(name: string) {
  return name.match(/^([A-Z][A-Za-z-]+)/)?.[1] ?? null;
}

const mappingByLearningUnit = new Map(
  minimumNomenclatureMappings.map((mapping) => [mapping.sourceUnitId, mapping]),
);

function objectiveIdForGenusUnit(unit: MinimumGenusSourceUnit) {
  return `objective-${unit.id.replace(/^genus-source-/, "")}`;
}

export const minimumGenusTeachingMaps: MinimumGenusTeachingMap[] =
  minimumGenusSourceUnits.map((teachingUnit) => {
    const objectiveId = objectiveIdForGenusUnit(teachingUnit);
    const childUnits = sourceMinimumLearningUnits.filter(
      (unit) => unit.sourceHeadingId === objectiveId,
    );

    const currentChildGenera = new Set<string>();
    for (const child of childUnits) {
      const mapping = mappingByLearningUnit.get(child.id);
      if (!mapping) {
        throw new Error(`Missing nomenclature mapping for child ${child.id}`);
      }
      for (const currentName of mapping.currentAcceptedNames) {
        const genus = genusFromCurrentName(currentName);
        if (genus) currentChildGenera.add(genus);
      }
    }

    return {
      teachingUnitId: teachingUnit.id,
      sourceLabel: teachingUnit.sourceLabel,
      sourceRank: teachingUnit.sourceRank,
      sourcePage: teachingUnit.sourcePage,
      sourceGenera: sourceGeneraForTeachingLabel(teachingUnit.sourceLabel),
      currentChildGenera: [...currentChildGenera].sort((a, b) => a.localeCompare(b, "it")),
      childLearningUnitIds: childUnits.map((unit) => unit.id),
      status: currentChildGenera.size > 0 ? "childMapped" : "sourceOnly",
    };
  });

export function currentGenusIndexFromTeachingMaps(
  maps: readonly MinimumGenusTeachingMap[] = minimumGenusTeachingMaps,
) {
  return [...new Set(maps.flatMap((entry) => entry.currentChildGenera))]
    .sort((a, b) => a.localeCompare(b, "it"));
}
