export type ForagingSymbolId =
  | "porcini"
  | "galletti"
  | "trombette"
  | "sanguinelli"
  | "ovuli-buoni"
  | "mazze-tamburo"
  | "spugnole"
  | "marzuoli"
  | "prugnoli"
  | "steccherini"
  | "cardoncelli"
  | "pioppini";

export type ForagingSymbol = {
  id: ForagingSymbolId;
  label: string;
  scientificLabel: string;
  taxonIds: readonly string[];
  assetPath: string;
  studyCue: string;
  showThreshold: number;
};

export const DEFAULT_FORAGING_SYMBOL_THRESHOLD = 62;

export const foragingSymbols: readonly ForagingSymbol[] = [
  {
    id: "porcini",
    label: "Porcini",
    scientificLabel: "Boletus edulis group",
    taxonIds: ["boletus-edulis"],
    assetPath: "/symbols/porcini.svg",
    studyCue: "Cappello bruno, gambo tozzo chiaro, pori sotto il cappello.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "galletti",
    label: "Galletti",
    scientificLabel: "Cantharellus cibarius group",
    taxonIds: ["cantharellus-cibarius"],
    assetPath: "/symbols/galletti.svg",
    studyCue: "Giallo dorato, cappello ondulato, pieghe decorrenti.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "trombette",
    label: "Trombette dei morti",
    scientificLabel: "Craterellus cornucopioides",
    taxonIds: ["craterellus-cornucopioides"],
    assetPath: "/symbols/trombette.svg",
    studyCue: "Forma a tromba scura, cava, con margine ondulato.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "sanguinelli",
    label: "Sanguinelli",
    scientificLabel: "Lactarius deliciosus group",
    taxonIds: ["lactarius-deliciosi"],
    assetPath: "/symbols/sanguinelli.svg",
    studyCue: "Cappello arancio zonato, centro depresso, possibili inverdimenti.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "ovuli-buoni",
    label: "Ovuli buoni",
    scientificLabel: "Amanita caesarea",
    taxonIds: ["amanita-caesarea"],
    assetPath: "/symbols/ovuli-buoni.svg",
    studyCue: "Cappello arancio, gambo e lamelle gialli, volva bianca.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "mazze-tamburo",
    label: "Mazze di tamburo",
    scientificLabel: "Macrolepiota procera",
    taxonIds: ["macrolepiota-procera"],
    assetPath: "/symbols/mazze-tamburo.svg",
    studyCue: "Cappello ampio squamoso, umbone scuro, gambo alto zebrato.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "spugnole",
    label: "Spugnole",
    scientificLabel: "Morchella group",
    taxonIds: ["morchella"],
    assetPath: "/symbols/spugnole.svg",
    studyCue: "Cappello alveolato a nido d'ape, gambo chiaro.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "marzuoli",
    label: "Marzuoli",
    scientificLabel: "Hygrophorus marzuolus",
    taxonIds: ["hygrophorus-marzuolus"],
    assetPath: "/symbols/marzuoli.svg",
    studyCue: "Fungo basso e compatto, cappello grigio-bruno, spesso semi-interrato.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "prugnoli",
    label: "Prugnoli",
    scientificLabel: "Calocybe gambosa",
    taxonIds: ["calocybe-gambosa"],
    assetPath: "/symbols/prugnoli.svg",
    studyCue: "Cappello bianco-crema carnoso, gambo corto, lamelle fitte chiare.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "steccherini",
    label: "Steccherini",
    scientificLabel: "Hydnum repandum",
    taxonIds: ["hydnum-repandum"],
    assetPath: "/symbols/steccherini.svg",
    studyCue: "Cappello irregolare chiaro, aculei visibili sotto il cappello.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "cardoncelli",
    label: "Cardoncelli",
    scientificLabel: "Pleurotus eryngii group",
    taxonIds: ["pleurotus-eryngii"],
    assetPath: "/symbols/cardoncelli.svg",
    studyCue: "Cappello beige-grigio, gambo robusto, lamelle decorrenti.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
  {
    id: "pioppini",
    label: "Pioppini",
    scientificLabel: "Cyclocybe cylindracea",
    taxonIds: ["cyclocybe-cylindracea"],
    assetPath: "/symbols/pioppini.svg",
    studyCue: "Crescita cespitosa, cappelli miele con centro più scuro, piccolo anello.",
    showThreshold: DEFAULT_FORAGING_SYMBOL_THRESHOLD,
  },
] as const;

export function visibleForagingSymbols(
  speciesScores: Readonly<Record<string, number>>,
): Array<ForagingSymbol & { score: number }> {
  return foragingSymbols.flatMap((symbol) => {
    const score = Math.max(
      ...symbol.taxonIds.map((taxonId) => speciesScores[taxonId] ?? 0),
    );
    if (score < symbol.showThreshold) return [];
    return [{ ...symbol, score }];
  });
}
