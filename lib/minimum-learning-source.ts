import objectives from "../data/taxonomic-objectives.json" with { type: "json" };

import type { TaxonRank } from "./domain.ts";
import {
  COMPLETE_MINIMUM_UNIT_TARGET,
  type LearningUnit,
} from "./learning-taxonomy.ts";

type SeedItem =
  | string
  | readonly [label: string, rank: TaxonRank]
  | readonly [label: string, rank: TaxonRank, deepMorphologyRequired: boolean];

type SeedGroup = {
  heading: string;
  items: readonly SeedItem[];
};

const groups: readonly SeedGroup[] = [
  { heading: "Agaricus", items: [
    ["Agaricus sez. Xanthodermatei", "section", true],
    "Agaricus bresadolanus",
    ["Agaricus sez. Arvenses", "section"],
    ["Agaricus sez. Sanguinolenti", "section"],
    "Agaricus campestris",
    "Agaricus bitorquis",
    "Agaricus bisporus",
  ]},
  { heading: "Agrocybe + Cyclocybe", items: ["Cyclocybe cylindracea"] },
  { heading: "Amanita", items: [
    ["Amanita phalloides", "species", true],
    ["Amanita verna (inclusa A. vidua)", "species", true],
    ["Amanita virosa", "species", true],
    ["Amanita proxima", "species", true],
    ["Amanita ovoidea", "species", true],
    ["Amanita pantherina", "species", true],
    ["Amanita muscaria", "species", true],
    ["Amanita caesarea", "species", true],
    "Amanita gemmata",
    "Amanita citrina",
    "Amanita porphyria",
    ["Amanita excelsa s.l. (incl. A. spissa, A. franchetii)", "speciesGroup"],
    "Amanita strobiliformis",
    "Amanita vittadinii",
    "Amanita rubescens",
    ["Amanita sez. Vaginatae", "section"],
  ]},
  { heading: "Calocybe", items: ["Calocybe gambosa"] },
  { heading: "Clitocybe s.l.", items: [
    ["Clitocybe cerussata (= C. phyllophila)", "species", true],
    ["Clitocybe dealbata (= C. rivulosa)", "species", true],
    ["Clitocybe nebularis", "species", true],
    ["Clitocybe geotropa", "species", true],
    "Clitocybe amoenolens",
    ["Clitocybe gibba s.l.", "speciesGroup"],
  ]},
  { heading: "Clitopilus", items: [["Clitopilus prunulus s.l.", "speciesGroup"]] },
  { heading: "Collybioidi e Marasmioidi", items: [
    "Collybia maculata",
    "Collybia fusipes",
    "Marasmius oreades",
  ]},
  { heading: "Coprinus s.l.", items: [
    ["Coprinus atramentarius s.l.", "speciesGroup"],
    "Coprinus comatus",
  ]},
  { heading: "Cortinarius", items: [
    ["Cortinarius orellanus", "species", true],
    ["Cortinarius orellanoides (= C. rubellus, C. speciosissimus)", "species", true],
    ["Cortinarius sottogenere Dermocybe", "subgenus"],
    "Cortinarius praestans",
    "Cortinarius cumatilis",
    "Cortinarius variiformis",
    "Cortinarius caperatus (= Rozites caperatus)",
  ]},
  { heading: "Entoloma", items: [
    ["Entoloma sinuatum", "species", true],
    ["Entoloma rhodopolium s.l.", "speciesGroup"],
    "Entoloma hirtipes",
    "Entoloma vernum",
    ["Entoloma clypeatum s.l.", "speciesGroup"],
    "Entoloma saundersii",
  ]},
  { heading: "Flammulina", items: [["Flammulina velutipes s.l.", "speciesGroup"]] },
  { heading: "Galerina", items: [["Galerina marginata group", "speciesGroup"]] },
  { heading: "Hygrocybe", items: [
    ["Hygrocybe conica s.l.", "speciesGroup"],
    "Hygrocybe punicea",
  ]},
  { heading: "Hygrophorus + Cuphophyllus", items: [
    "Hygrophorus marzuolus",
    "Hygrophorus russula",
    "Hygrophorus penarioides",
  ]},
  { heading: "Hypholoma", items: [
    ["Hypholoma fasciculare", "species", true],
    "Hypholoma lateritium",
  ]},
  { heading: "Lentinula", items: ["Lentinula edodes"] },
  { heading: "Lepiotoidi:", items: [
    ["Lepiota subincarnata (= L. josserandii)", "species", true],
    ["Lepiota brunneoincarnata", "species", true],
    ["Lepiota cristata", "species", true],
    "Lepiota elaiophylla",
    "Chlorophyllum molybdites",
    ["Echinoderma asperum s.l.", "speciesGroup"],
    ["Leucoagaricus leucothites s.l.", "speciesGroup"],
    ["Chlorophyllum rhacodes s.l.", "speciesGroup"],
    ["Macrolepiota procera s.l.", "speciesGroup"],
  ]},
  { heading: "Lepista", items: [
    ["Lepista nuda s.l.", "speciesGroup"],
    ["Lepista flaccida s.l.", "speciesGroup"],
  ]},
  { heading: "Leucopaxillus", items: [
    ["Leucopaxillus giganteus s.l.", "speciesGroup"],
    "Leucopaxillus gentianeus",
  ]},
  { heading: "Lyophyllum", items: [
    ["Lyophyllum decastes s.l.", "speciesGroup"],
    ["Lyophyllum specie annerenti", "speciesGroup"],
    "Lyophyllum connatum",
  ]},
  { heading: "Mycena", items: [["Mycena sez. Purae", "section"]] },
  { heading: "Omphalotus", items: [["Omphalotus olearius", "species", true]] },
  { heading: "Panaeolus", items: ["Panaeolus cyanescens"] },
  { heading: "Pholiota + Kuehneromyces", items: ["Kuehneromyces mutabilis"] },
  { heading: "Pleurotus", items: [
    ["Pleurotus eryngii s.l.", "speciesGroup"],
    "Pleurotus ostreatus",
    "Pleurotus cornucopiae (incluso P. citrinopileatus)",
  ]},
  { heading: "Stropharia s.l.", items: ["Stropharia rugosoannulata"] },
  { heading: "Tricholoma", items: [
    ["Tricholoma pardinum", "species", true],
    ["Tricholoma filamentosum", "species", true],
    ["Tricholoma josserandii", "species", true],
    ["Tricholoma equestre", "species", true],
    ["Tricholoma portentosum", "species", true],
    ["Tricholoma terreum", "species", true],
    ["Tricholoma saponaceum s.l.", "speciesGroup"],
    "Tricholoma columbetta",
    ["Tricholoma album s.l. (incl. T. stiparophyllum, T. lascivum e altri)", "speciesGroup"],
    ["Tricholoma gruppo T. terreum (T. scalpturatum, T. orirubens, T. squarrulosum e altre)", "speciesGroup"],
    ["Tricholoma gruppo Virgati (T. virgatum, T. sciodes, T. bresadolanum)", "speciesGroup"],
    "Tricholoma sejunctum",
    "Tricholoma sulphureum",
    ["Tricholoma sez. Genuina (= gruppo Albobrunnei)", "section"],
    ["Tricholoma acerbum s.l.", "speciesGroup"],
  ]},
  { heading: "Volvariella + Volvopluteus", items: [
    "Volvopluteus gloiocephalus",
    "Volvariella volvacea",
  ]},
  { heading: "Lactarius", items: [
    ["Lactarius sez. Deliciosi", "section"],
    "Lactarius porniniae",
    ["Lactarius volemus s.l.", "speciesGroup"],
    "Lactarius tesquorum",
  ]},
  { heading: "Russula", items: [
    ["Russula Foetentinae", "subsection"],
    ["Russula Compactae Nigricantinae", "subsection"],
    ["Russula Compactae Lactarioides (= gruppo R. delica)", "speciesGroup"],
  ]},
  { heading: "Boletus s. str.", items: [["Boletus edulis s.l.", "speciesGroup", true]] },
  { heading: "Boletus ex sez. Luridi", items: [
    ["Boletus sez. Luridi", "section"],
    "Boletus (Rubroboletus) satanas",
    "Boletus pulchrotinctus",
    ["Boletus (Neoboletus) erythropus s.l.", "speciesGroup"],
    "Boletus (Suillellus) luridus",
    ["Boletus queletii e specie vicine/intermedie", "speciesGroup"],
  ]},
  { heading: "Caloboletus", items: ["Caloboletus radicans", "Caloboletus calopus"] },
  { heading: "Gyroporus", items: [
    "Gyroporus cyanescens",
    ["Gyroporus castaneus s.l.", "speciesGroup"],
  ]},
  { heading: "Hygrophoropsis", items: ["Hygrophoropsis aurantiaca"] },
  { heading: "Imleria", items: ["Imleria badia"] },
  { heading: "Suillus", items: ["Suillus luteus", "Suillus granulatus"] },
  { heading: "Tylopilus", items: ["Tylopilus felleus"] },
  { heading: "Cantharellus", items: [["Cantharellus cibarius complex", "speciesGroup", true]] },
  { heading: "Craterellus", items: [
    "Craterellus lutescens",
    "Craterellus tubaeformis",
    "Craterellus cornucopioides",
  ]},
  { heading: "Gomphus", items: ["Gomphus clavatus"] },
  { heading: "Hydnaceae s.l.", items: [
    ["Hydnum spp. / H. repandum s.l. (incl. gruppo H. rufescens)", "speciesGroup"],
    ["Hericium spp.", "genus"],
    ["Sarcodon imbricatus s.l. (incl. S. squamosus)", "speciesGroup"],
  ]},
  { heading: "Polyporaceae s.l.", items: [
    "Hapalopilus rutilans",
    ["Laetiporus sulphureus s.l.", "speciesGroup"],
    "Albatrellus confluens",
    ["Albatrellus ovinus s.l. (incl. A. subrubescens, A. citrinus)", "speciesGroup"],
    "Scutiger pes-caprae",
    "Fistulina hepatica",
    "Grifola frondosa",
    "Polyporus umbellatus",
    "Meripilus giganteus",
    "Polyporus squamosus",
  ]},
  { heading: "Ramaria", items: [
    "Ramaria formosa",
    "Ramaria pallida",
    ["Ramaria botrytis s.l.", "speciesGroup"],
  ]},
  { heading: "Auricularia", items: ["Auricularia auricula-judae"] },
  { heading: "Gyromitra", items: ["Gyromitra esculenta"] },
  { heading: "Sarcosphaera", items: [["Sarcosphaera coronaria s.l.", "speciesGroup"]] },
] as const;

function slug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function resolveObjective(prefix: string) {
  const matches = objectives.filter((entry) =>
    entry.scientificName === prefix || entry.scientificName.startsWith(prefix),
  );
  if (matches.length !== 1) {
    throw new Error(`Expected one objective heading for "${prefix}", found ${matches.length}`);
  }
  return matches[0];
}

function normalizeItem(item: SeedItem) {
  if (typeof item === "string") {
    return { label: item, rank: "species" as const, deepMorphologyRequired: false };
  }
  return {
    label: item[0],
    rank: item[1],
    deepMorphologyRequired: item[2] ?? false,
  };
}

export const sourceMinimumLearningUnits: LearningUnit[] = groups.flatMap((group) => {
  const objective = resolveObjective(group.heading);
  return group.items.map((rawItem, index) => {
    const item = normalizeItem(rawItem);
    return {
      id: `${objective.id}--${String(index + 1).padStart(2, "0")}--${slug(item.label)}`,
      sourceHeadingId: objective.id,
      sourceLabel: item.label,
      sourcePage: objective.sources.minimumObjectives.page,
      level: "minimum" as const,
      requiredResolution: item.rank,
      deepMorphologyRequired: item.deepMorphologyRequired,
      reviewStatus: "normalized" as const,
    };
  });
});

if (sourceMinimumLearningUnits.length !== COMPLETE_MINIMUM_UNIT_TARGET) {
  throw new Error(
    `Minimum source inventory has ${sourceMinimumLearningUnits.length} units; expected ${COMPLETE_MINIMUM_UNIT_TARGET}`,
  );
}
