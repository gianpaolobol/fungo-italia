import {
  sourceMinimumLearningUnits,
} from "./minimum-learning-source.ts";
import type {
  LearningNomenclatureMapping,
  NomenclatureEvidence,
} from "./learning-taxonomy.ts";

const CHECKED_AT = "2026-09-21";
const INDEX_FUNGORUM_NAME_SEARCH =
  "https://www.indexfungorum.org/ixfwebservice/fungus.asmx/NameSearch";
const S1_REFERENCE = "source:S1:Obiettivi-tassonomici-V4-2026-06-09";
const AMANITA_VIDUA_REVIEW =
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC9138314/";

function indexEvidence(
  queryName: string,
  expectedCurrentName: string,
  recordId?: string,
): NomenclatureEvidence {
  return {
    source: "index-fungorum",
    sourceUrl: recordId
      ? `https://www.indexfungorum.org/names/NamesRecord.asp?RecordID=${recordId}`
      : INDEX_FUNGORUM_NAME_SEARCH,
    checkedAt: CHECKED_AT,
    recordId,
    queryName,
    expectedCurrentName,
  };
}

function sourceEvidence(page: number): NomenclatureEvidence {
  return {
    source: "source-s1",
    sourceUrl: `${S1_REFERENCE}#page=${page}`,
    checkedAt: CHECKED_AT,
    note: "Concetto didattico conservato alla risoluzione prescritta dalla fonte S1.",
  };
}

type Override = Omit<LearningNomenclatureMapping, "sourceUnitId" | "sourceLabel">;

function accepted(
  currentAcceptedName: string,
  queryName = currentAcceptedName,
  recordId?: string,
  notes?: string,
): Override {
  return {
    status: "accepted",
    currentAcceptedNames: [currentAcceptedName],
    preferredDisplayName: currentAcceptedName,
    evidence: [indexEvidence(queryName, currentAcceptedName, recordId)],
    notes,
  };
}

function sourceConcept(
  page: number,
  preferredDisplayName: string,
  currentAcceptedNames: string[] = [],
  currentEvidence: NomenclatureEvidence[] = [],
  notes?: string,
): Override {
  return {
    status: "sourceConcept",
    currentAcceptedNames,
    preferredDisplayName,
    evidence: [sourceEvidence(page), ...currentEvidence],
    notes,
  };
}

function conflict(
  preferredDisplayName: string,
  currentAcceptedNames: string[],
  evidence: NomenclatureEvidence[],
  notes: string,
): Override {
  return {
    status: "conflict",
    currentAcceptedNames,
    preferredDisplayName,
    evidence,
    notes,
  };
}

const overrides = new Map<string, Override>([
  [
    "Amanita verna (inclusa A. vidua)",
    conflict(
      "Amanita verna / Amanita vidua",
      ["Amanita verna", "Amanita vidua"],
      [
        indexEvidence("Amanita verna", "Amanita verna", "163667"),
        indexEvidence("Amanita vidua", "Amanita vidua"),
        {
          source: "peer-reviewed",
          sourceUrl: AMANITA_VIDUA_REVIEW,
          checkedAt: CHECKED_AT,
          note: "Alvarado et al. (2022) riconoscono A. verna e A. vidua come specie distinte.",
        },
      ],
      "S1 include A. vidua in A. verna, mentre la revisione moderna separa i due taxa. Il conflitto resta esplicito e blocca una falsa equivalenza.",
    ),
  ],
  [
    "Amanita vittadinii",
    accepted(
      "Saproamanita vittadinii",
      "Amanita vittadinii",
      "174636",
      "Trasferimento di genere accettato da Index Fungorum.",
    ),
  ],
  [
    "Clitocybe cerussata (= C. phyllophila)",
    accepted(
      "Collybia phyllophila",
      "Clitocybe cerussata",
      "155698",
      "Il nome sorgente confluisce nel nome corrente Collybia phyllophila.",
    ),
  ],
  [
    "Clitocybe dealbata (= C. rivulosa)",
    conflict(
      "Clitocybe dealbata / Collybia rivulosa",
      ["Clitocybe dealbata", "Collybia rivulosa"],
      [
        indexEvidence("Clitocybe dealbata", "Clitocybe dealbata", "216184"),
        indexEvidence("Clitocybe rivulosa", "Collybia rivulosa", "198283"),
      ],
      "La sinonimia letterale usata da S1 non coincide con il trattamento corrente di Index Fungorum: i due nomi conducono a taxa correnti distinti.",
    ),
  ],
  [
    "Clitocybe geotropa",
    accepted("Infundibulicybe geotropa", "Clitocybe geotropa", "242479"),
  ],
  [
    "Clitocybe amoenolens",
    accepted("Paralepistopsis amoenolens", "Clitocybe amoenolens", "311313"),
  ],
  [
    "Clitocybe gibba s.l.",
    sourceConcept(
      5,
      "Clitocybe gibba s.l.",
      ["Infundibulicybe gibba"],
      [indexEvidence("Clitocybe gibba", "Infundibulicybe gibba", "356792")],
      "Il concetto s.l. resta un gruppo didattico; il nome corrente del nucleo nominale e Infundibulicybe gibba.",
    ),
  ],
  [
    "Clitopilus prunulus s.l.",
    sourceConcept(
      5,
      "Clitopilus prunulus s.l.",
      ["Clitopilus prunulus"],
      [indexEvidence("Clitopilus prunulus", "Clitopilus prunulus")],
    ),
  ],
  [
    "Collybia maculata",
    accepted("Rhodocollybia maculata", "Collybia maculata", "169412"),
  ],
  [
    "Collybia fusipes",
    accepted("Gymnopus fusipes", "Collybia fusipes", "160099"),
  ],
  [
    "Coprinus atramentarius s.l.",
    sourceConcept(
      6,
      "Coprinus atramentarius s.l.",
      ["Coprinopsis atramentaria"],
      [indexEvidence("Coprinus atramentarius", "Coprinopsis atramentaria", "220725")],
    ),
  ],
  [
    "Cortinarius orellanoides (= C. rubellus, C. speciosissimus)",
    accepted(
      "Cortinarius rubellus",
      "Cortinarius orellanoides",
      undefined,
      "Le forme nominali citate da S1 confluiscono nel nome corrente Cortinarius rubellus.",
    ),
  ],
  [
    "Cortinarius variiformis",
    accepted(
      "Phlegmacium variiforme",
      "Cortinarius variiformis",
      "312192",
      "Il servizio Index Fungorum restituisce Phlegmacium variiforme come CURRENT NAME.",
    ),
  ],
  [
    "Cortinarius caperatus (= Rozites caperatus)",
    accepted(
      "Cortinarius caperatus",
      "Cortinarius caperatus",
      undefined,
      "Rozites caperatus e conservato come sinonimo/alias, non come scheda distinta.",
    ),
  ],
  [
    "Flammulina velutipes s.l.",
    sourceConcept(
      7,
      "Flammulina velutipes s.l.",
      ["Flammulina velutipes"],
      [indexEvidence("Flammulina velutipes", "Flammulina velutipes")],
    ),
  ],
  [
    "Galerina marginata group",
    sourceConcept(
      7,
      "Galerina marginata group",
      ["Galerina marginata"],
      [indexEvidence("Galerina marginata", "Galerina marginata")],
    ),
  ],
  [
    "Hygrocybe conica s.l.",
    sourceConcept(
      8,
      "Hygrocybe conica s.l.",
      ["Hygrocybe conica"],
      [indexEvidence("Hygrocybe conica", "Hygrocybe conica")],
    ),
  ],
  [
    "Lepiota subincarnata (= L. josserandii)",
    accepted(
      "Lepiota subincarnata",
      "Lepiota subincarnata",
      undefined,
      "L. josserandii e mantenuto come sinonimo storico della stessa unita didattica.",
    ),
  ],
  [
    "Echinoderma asperum s.l.",
    sourceConcept(
      9,
      "Echinoderma asperum s.l.",
      ["Echinoderma asperum"],
      [indexEvidence("Echinoderma asperum", "Echinoderma asperum")],
    ),
  ],
  [
    "Leucoagaricus leucothites s.l.",
    sourceConcept(
      9,
      "Leucoagaricus leucothites s.l.",
      ["Leucocoprinus leucothites"],
      [indexEvidence("Leucoagaricus leucothites", "Leucocoprinus leucothites", "355733")],
    ),
  ],
  [
    "Chlorophyllum rhacodes s.l.",
    sourceConcept(
      9,
      "Chlorophyllum rhacodes s.l.",
      ["Chlorophyllum rhacodes"],
      [indexEvidence("Chlorophyllum rhacodes", "Chlorophyllum rhacodes")],
    ),
  ],
  [
    "Macrolepiota procera s.l.",
    sourceConcept(
      9,
      "Macrolepiota procera s.l.",
      ["Macrolepiota procera"],
      [indexEvidence("Macrolepiota procera", "Macrolepiota procera")],
    ),
  ],
  [
    "Lepista nuda s.l.",
    sourceConcept(
      9,
      "Lepista nuda s.l.",
      ["Collybia nuda"],
      [indexEvidence("Lepista nuda", "Collybia nuda", "356735")],
    ),
  ],
  [
    "Lepista flaccida s.l.",
    sourceConcept(
      9,
      "Lepista flaccida s.l.",
      ["Paralepista flaccida"],
      [indexEvidence("Lepista flaccida", "Paralepista flaccida", "357467")],
    ),
  ],
  [
    "Leucopaxillus giganteus s.l.",
    sourceConcept(
      10,
      "Leucopaxillus giganteus s.l.",
      ["Aspropaxillus giganteus"],
      [indexEvidence("Leucopaxillus giganteus", "Aspropaxillus giganteus", "283342")],
    ),
  ],
  [
    "Lyophyllum decastes s.l.",
    sourceConcept(
      10,
      "Lyophyllum decastes s.l.",
      ["Lyophyllum decastes"],
      [indexEvidence("Lyophyllum decastes", "Lyophyllum decastes")],
    ),
  ],
  [
    "Lyophyllum connatum",
    accepted("Leucocybe connata", "Lyophyllum connatum", "355617"),
  ],
  [
    "Pleurotus eryngii s.l.",
    sourceConcept(
      11,
      "Pleurotus eryngii s.l.",
      ["Pleurotus eryngii"],
      [indexEvidence("Pleurotus eryngii", "Pleurotus eryngii")],
    ),
  ],
  [
    "Pleurotus cornucopiae (incluso P. citrinopileatus)",
    conflict(
      "Pleurotus cornucopiae / Pleurotus citrinopileatus",
      ["Pleurotus cornucopiae", "Pleurotus citrinopileatus"],
      [
        indexEvidence("Pleurotus cornucopiae", "Pleurotus cornucopiae", "355897"),
        indexEvidence("Pleurotus citrinopileatus", "Pleurotus citrinopileatus", "303973"),
      ],
      "S1 include P. citrinopileatus nella voce di P. cornucopiae, ma Index Fungorum mantiene entrambi come specie correnti distinte.",
    ),
  ],
  [
    "Tricholoma saponaceum s.l.",
    sourceConcept(
      12,
      "Tricholoma saponaceum s.l.",
      ["Tricholoma saponaceum"],
      [indexEvidence("Tricholoma saponaceum", "Tricholoma saponaceum")],
    ),
  ],
  [
    "Tricholoma acerbum s.l.",
    sourceConcept(
      12,
      "Tricholoma acerbum s.l.",
      ["Tricholoma acerbum"],
      [indexEvidence("Tricholoma acerbum", "Tricholoma acerbum")],
    ),
  ],
  [
    "Lactarius volemus s.l.",
    sourceConcept(
      13,
      "Lactarius volemus s.l.",
      ["Lactifluus volemus"],
      [indexEvidence("Lactarius volemus", "Lactifluus volemus", "231293")],
    ),
  ],
  [
    "Boletus edulis s.l.",
    sourceConcept(
      14,
      "Boletus edulis s.l.",
      ["Boletus edulis"],
      [indexEvidence("Boletus edulis", "Boletus edulis")],
    ),
  ],
  [
    "Boletus (Rubroboletus) satanas",
    accepted("Rubroboletus satanas", "Boletus satanas"),
  ],
  [
    "Boletus pulchrotinctus",
    accepted("Rubroboletus pulchrotinctus", "Boletus pulchrotinctus"),
  ],
  [
    "Boletus (Neoboletus) erythropus s.l.",
    sourceConcept(
      15,
      "Boletus (Neoboletus) erythropus s.l.",
      ["Neoboletus erythropus"],
      [indexEvidence("Boletus erythropus", "Neoboletus erythropus")],
      "Il concetto s.l. resta didattico; il nucleo nominale e ricondotto al nome corrente Neoboletus erythropus.",
    ),
  ],
  [
    "Boletus (Suillellus) luridus",
    accepted("Suillellus luridus", "Boletus luridus"),
  ],
  [
    "Boletus queletii e specie vicine/intermedie",
    sourceConcept(
      15,
      "Boletus queletii e specie vicine/intermedie",
      ["Suillellus queletii"],
      [indexEvidence("Boletus queletii", "Suillellus queletii")],
    ),
  ],
  [
    "Gyroporus castaneus s.l.",
    sourceConcept(
      16,
      "Gyroporus castaneus s.l.",
      ["Gyroporus castaneus"],
      [indexEvidence("Gyroporus castaneus", "Gyroporus castaneus")],
    ),
  ],
  [
    "Cantharellus cibarius complex",
    sourceConcept(
      17,
      "Cantharellus cibarius complex",
      ["Cantharellus cibarius"],
      [indexEvidence("Cantharellus cibarius", "Cantharellus cibarius", "200345")],
    ),
  ],
  [
    "Hydnum spp. / H. repandum s.l. (incl. gruppo H. rufescens)",
    sourceConcept(
      18,
      "Hydnum spp. / H. repandum s.l. (incl. gruppo H. rufescens)",
      ["Hydnum repandum"],
      [indexEvidence("Hydnum repandum", "Hydnum repandum")],
    ),
  ],
  [
    "Hericium spp.",
    sourceConcept(
      18,
      "Hericium spp.",
      [],
      [],
      "Il requisito S1 e al genere; non viene inventata una specie rappresentativa.",
    ),
  ],
  [
    "Sarcodon imbricatus s.l. (incl. S. squamosus)",
    sourceConcept(
      18,
      "Sarcodon imbricatus s.l. (incl. S. squamosus)",
      ["Sarcodon imbricatus", "Sarcodon squamosus"],
      [
        indexEvidence("Sarcodon imbricatus", "Sarcodon imbricatus"),
        indexEvidence("Sarcodon squamosus", "Sarcodon squamosus"),
      ],
    ),
  ],
  [
    "Laetiporus sulphureus s.l.",
    sourceConcept(
      18,
      "Laetiporus sulphureus s.l.",
      ["Laetiporus sulphureus"],
      [indexEvidence("Laetiporus sulphureus", "Laetiporus sulphureus")],
    ),
  ],
  [
    "Albatrellus confluens",
    accepted("Albatrellopsis confluens", "Albatrellus confluens", "292349"),
  ],
  [
    "Albatrellus ovinus s.l. (incl. A. subrubescens, A. citrinus)",
    sourceConcept(
      18,
      "Albatrellus ovinus s.l. (incl. A. subrubescens, A. citrinus)",
      ["Albatrellus ovinus", "Albatrellus subrubescens", "Albatrellus citrinus"],
      [
        indexEvidence("Albatrellus ovinus", "Albatrellus ovinus"),
        indexEvidence("Albatrellus subrubescens", "Albatrellus subrubescens"),
        indexEvidence("Albatrellus citrinus", "Albatrellus citrinus"),
      ],
    ),
  ],
  [
    "Polyporus squamosus",
    accepted("Cerioporus squamosus", "Polyporus squamosus"),
  ],
  [
    "Ramaria botrytis s.l.",
    sourceConcept(
      19,
      "Ramaria botrytis s.l.",
      ["Ramaria botrytis"],
      [indexEvidence("Ramaria botrytis", "Ramaria botrytis", "356843")],
    ),
  ],
  [
    "Sarcosphaera coronaria s.l.",
    sourceConcept(
      21,
      "Sarcosphaera coronaria s.l.",
      ["Sarcosphaera coronaria"],
      [indexEvidence("Sarcosphaera coronaria", "Sarcosphaera coronaria")],
    ),
  ],
]);

function sourceBinomial(label: string) {
  const match = label.match(/^([A-Z][a-z-]+)\s+([a-z][a-z-]+)/);
  return match ? `${match[1]} ${match[2]}` : null;
}

function mappingForUnit(
  unit: (typeof sourceMinimumLearningUnits)[number],
): LearningNomenclatureMapping {
  const override = overrides.get(unit.sourceLabel);
  if (override) {
    return {
      sourceUnitId: unit.id,
      sourceLabel: unit.sourceLabel,
      ...override,
    };
  }

  if (unit.requiredResolution === "species") {
    const name = sourceBinomial(unit.sourceLabel);
    if (!name) {
      return {
        sourceUnitId: unit.id,
        sourceLabel: unit.sourceLabel,
        status: "unresolved",
        currentAcceptedNames: [],
        preferredDisplayName: unit.sourceLabel,
        evidence: [sourceEvidence(unit.sourcePage)],
        notes: "Il nome sorgente non e traducibile automaticamente in un binomio verificabile.",
      };
    }
    return {
      sourceUnitId: unit.id,
      sourceLabel: unit.sourceLabel,
      ...accepted(name),
    };
  }

  return {
    sourceUnitId: unit.id,
    sourceLabel: unit.sourceLabel,
    ...sourceConcept(
      unit.sourcePage,
      unit.sourceLabel,
      [],
      [],
      "La risoluzione richiesta da S1 non e una specie singola: il concetto sorgente resta autonomo.",
    ),
  };
}

export const minimumNomenclatureMappings: LearningNomenclatureMapping[] =
  sourceMinimumLearningUnits.map(mappingForUnit);

export const nomenclatureConflicts = minimumNomenclatureMappings.filter(
  (mapping) => mapping.status === "conflict",
);

export const unresolvedNomenclatureMappings = minimumNomenclatureMappings.filter(
  (mapping) => mapping.status === "unresolved",
);
