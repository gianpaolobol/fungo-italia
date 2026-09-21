import generatedTaxa from "../data/atlas-taxa.json" with { type: "json" };

import type { EdibilityCategory } from "./minimum-card.ts";

type GeneratedTaxon = {
  scientificName: string;
  edibility: string;
};

const generated = generatedTaxa as GeneratedTaxon[];

export interface ProvisionalSafety {
  category: EdibilityCategory;
  treatmentCodes: string[];
  summary: string;
}

const overrides = new Map<string, ProvisionalSafety>([
  ["Agaricus sez. Xanthodermatei", provisional("POISONOUS")],
  ["Agaricus sez. Arvenses", provisional("EDIBLE")],
  ["Agaricus sez. Sanguinolenti", provisional("EDIBLE")],
  ["Amanita verna (inclusa A. vidua)", provisional("POISONOUS")],
  ["Amanita excelsa s.l. (incl. A. spissa, A. franchetii)", provisional("NOT_EDIBLE")],
  ["Amanita sez. Vaginatae", provisional("EDIBLE_AFTER_TREATMENT", ["completeCooking"])],
  ["Clitocybe cerussata (= C. phyllophila)", provisional("POISONOUS")],
  ["Clitocybe dealbata (= C. rivulosa)", provisional("POISONOUS")],
  ["Clitocybe gibba s.l.", provisional("EDIBLE")],
  ["Clitopilus prunulus s.l.", provisional("EDIBLE")],
  ["Coprinus atramentarius s.l.", provisional("NOT_EDIBLE")],
  ["Cortinarius orellanoides (= C. rubellus, C. speciosissimus)", provisional("POISONOUS")],
  ["Cortinarius sottogenere Dermocybe", provisional("NOT_EDIBLE")],
  ["Cortinarius caperatus (= Rozites caperatus)", provisional("EDIBLE")],
  ["Entoloma rhodopolium s.l.", provisional("POISONOUS")],
  ["Entoloma clypeatum s.l.", provisional("EDIBLE")],
  ["Flammulina velutipes s.l.", provisional("EDIBLE")],
  ["Galerina marginata group", provisional("POISONOUS")],
  ["Hygrocybe conica s.l.", provisional("POISONOUS")],
  ["Echinoderma asperum s.l.", provisional("NOT_EDIBLE")],
  ["Leucoagaricus leucothites s.l.", provisional("DISCOURAGED")],
  ["Chlorophyllum rhacodes s.l.", provisional("DISCOURAGED")],
  ["Macrolepiota procera s.l.", provisional("EDIBLE")],
  ["Lepista nuda s.l.", provisional("EDIBLE_AFTER_TREATMENT", ["completeCooking"])],
  ["Lepista flaccida s.l.", provisional("EDIBLE_AFTER_TREATMENT", ["completeCooking"])],
  ["Leucopaxillus giganteus s.l.", provisional("EDIBLE")],
  ["Lyophyllum decastes s.l.", provisional("EDIBLE")],
  ["Lyophyllum specie annerenti", provisional("NOT_ASSESSED")],
  ["Mycena sez. Purae", provisional("POISONOUS")],
  ["Pleurotus eryngii s.l.", provisional("EDIBLE")],
  ["Pleurotus cornucopiae (incluso P. citrinopileatus)", provisional("EDIBLE")],
  ["Tricholoma saponaceum s.l.", provisional("NOT_EDIBLE")],
  ["Tricholoma album s.l. (incl. T. stiparophyllum, T. lascivum e altri)", provisional("NOT_EDIBLE")],
  ["Tricholoma gruppo T. terreum (T. scalpturatum, T. orirubens, T. squarrulosum e altre)", provisional("EDIBLE")],
  ["Tricholoma gruppo Virgati (T. virgatum, T. sciodes, T. bresadolanum)", provisional("NOT_EDIBLE")],
  ["Tricholoma sez. Genuina (= gruppo Albobrunnei)", provisional("DISCOURAGED")],
  ["Tricholoma acerbum s.l.", provisional("EDIBLE")],
  ["Lactarius sez. Deliciosi", provisional("EDIBLE")],
  ["Lactarius volemus s.l.", provisional("EDIBLE")],
  ["Russula Foetentinae", provisional("POISONOUS")],
  ["Russula Compactae Nigricantinae", provisional("NOT_EDIBLE")],
  ["Russula Compactae Lactarioides (= gruppo R. delica)", provisional("EDIBLE")],
  ["Boletus edulis s.l.", provisional("EDIBLE")],
  ["Boletus sez. Luridi", provisional("NOT_ASSESSED")],
  ["Boletus (Rubroboletus) satanas", provisional("POISONOUS")],
  ["Boletus (Neoboletus) erythropus s.l.", provisional("EDIBLE_AFTER_TREATMENT", ["completeCooking"])],
  ["Boletus (Suillellus) luridus", provisional("EDIBLE_AFTER_TREATMENT", ["completeCooking"])],
  ["Boletus queletii e specie vicine/intermedie", provisional("EDIBLE_AFTER_TREATMENT", ["completeCooking"])],
  ["Gyroporus castaneus s.l.", provisional("DISCOURAGED")],
  ["Cantharellus cibarius complex", provisional("EDIBLE")],
  ["Hydnum spp. / H. repandum s.l. (incl. gruppo H. rufescens)", provisional("EDIBLE")],
  ["Hericium spp.", provisional("EDIBLE")],
  ["Sarcodon imbricatus s.l. (incl. S. squamosus)", provisional("EDIBLE")],
  ["Laetiporus sulphureus s.l.", provisional("EDIBLE_AFTER_TREATMENT", ["completeCooking", "youngSpecimensOnly"])],
  ["Albatrellus ovinus s.l. (incl. A. subrubescens, A. citrinus)", provisional("EDIBLE")],
  ["Ramaria botrytis s.l.", provisional("EDIBLE", ["youngSpecimensOnly"])],
  ["Sarcosphaera coronaria s.l.", provisional("NOT_EDIBLE")],
]);

function provisional(
  category: EdibilityCategory,
  treatmentCodes: string[] = [],
): ProvisionalSafety {
  const label: Record<EdibilityCategory, string> = {
    EDIBLE: "commestibile",
    EDIBLE_AFTER_TREATMENT: "commestibile solo dopo i trattamenti indicati",
    DISCOURAGED: "sconsigliato",
    NO_FOOD_VALUE: "privo di valore alimentare",
    NOT_EDIBLE: "non commestibile",
    POISONOUS: "tossico",
    NOT_ASSESSED: "non ancora classificato nel registro S2 strutturato",
  };
  return {
    category,
    treatmentCodes,
    summary:
      `Stato alimentare provvisorio: ${label[category]}. La scheda resta in revisione e non costituisce autorizzazione al consumo.`,
  };
}

function firstSourceBinomial(label: string) {
  const parenthetical = label.match(/^([A-Z][a-z-]+) \(([A-Z][a-z-]+)\) ([a-z][a-z-]+)/);
  if (parenthetical) return `${parenthetical[1]} ${parenthetical[3]}`;
  const match = label.match(/^([A-Z][a-z-]+) ([a-z][a-z-]+)/);
  return match ? `${match[1]} ${match[2]}` : null;
}

function standardized(value: string): ProvisionalSafety {
  if (value === "commestibile") return provisional("EDIBLE");
  if (value === "commestibile-dopo-trattamento") {
    return provisional("EDIBLE_AFTER_TREATMENT", ["completeCooking"]);
  }
  if (value === "sconsigliato") return provisional("DISCOURAGED");
  if (value === "non-commestibile") return provisional("NOT_EDIBLE");
  if (value === "tossico") return provisional("POISONOUS");
  if (value === "senza-valore") return provisional("NO_FOOD_VALUE");
  return provisional("NOT_ASSESSED");
}

export function provisionalSafetyForSourceLabel(label: string): ProvisionalSafety {
  const override = overrides.get(label);
  if (override) return override;
  const name = firstSourceBinomial(label);
  if (!name) return provisional("NOT_ASSESSED");
  const taxon = generated.find((entry) => entry.scientificName === name);
  return taxon ? standardized(taxon.edibility) : provisional("NOT_ASSESSED");
}
