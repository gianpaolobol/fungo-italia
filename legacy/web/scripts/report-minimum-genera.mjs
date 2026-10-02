import { sourceMinimumLearningUnits } from "../lib/minimum-learning-source.ts";
import { minimumNomenclatureMappings } from "../lib/minimum-nomenclature.ts";

function firstGenus(value) {
  return value.match(/^([A-Z][A-Za-z-]+)/)?.[1] ?? null;
}

const sourceGenera = new Set(
  sourceMinimumLearningUnits
    .map((unit) => firstGenus(unit.sourceLabel))
    .filter(Boolean),
);

const currentGenera = new Set(
  minimumNomenclatureMappings
    .flatMap((mapping) => mapping.currentAcceptedNames)
    .map(firstGenus)
    .filter(Boolean),
);

const sourceOnly = [...sourceGenera].filter((genus) => !currentGenera.has(genus)).sort();
const currentOnly = [...currentGenera].filter((genus) => !sourceGenera.has(genus)).sort();

console.log(JSON.stringify({
  sourceLearningUnitGenera: [...sourceGenera].sort(),
  sourceLearningUnitGenusCount: sourceGenera.size,
  currentMappedGenera: [...currentGenera].sort(),
  currentMappedGenusCount: currentGenera.size,
  sourceOnly,
  currentOnly,
}, null, 2));
