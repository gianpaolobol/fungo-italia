import type { AtlasTaxon } from "./domain.ts";
import { minimumCards } from "./minimum-cards.ts";
import type { SporePrintToken, SummaryCardPresentation } from "./summary-cards.ts";
import { publicDescriptiveCardContent } from "./public-scientific-policy.ts";

export type AutoSummaryBasis = "minimum-baseline" | "genus-context";
type AutoSummary = { basis: AutoSummaryBasis; presentation: SummaryCardPresentation; };
function normalizeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it").replace(/[^a-z0-9]+/g, " ").trim();
}
function sourceBinomial(label: string) {
  const match = label.match(/^([A-Z][A-Za-z-]+)\s+([a-z][A-Za-z-]+)/);
  return match ? match[1] + " " + match[2] : null;
}
const minimumByCurrentName = new Map<string, (typeof minimumCards)[number]>();
for (const card of minimumCards) {
  minimumByCurrentName.set(normalizeName(card.sourceLabel), card);
  if (card.rank !== "species" || card.currentAcceptedNames.length !== 1) continue;
  minimumByCurrentName.set(normalizeName(card.currentAcceptedNames[0]), card);
  const sourceName = sourceBinomial(card.sourceLabel);
  if (sourceName) {
    const key = normalizeName(sourceName);
    if (!minimumByCurrentName.has(key)) minimumByCurrentName.set(key, card);
  }
}
function sporePrintFromTerminology(terms: readonly string[]): SporePrintToken {
  const text = terms.join(" ").toLocaleLowerCase("it");
  if (/sporata\s+nera|spore?\s+nere|melanospore/.test(text)) return "black";
  if (/sporata\s+(porpora|bruno-porpora|porpora-bruna)|iantinospore/.test(text)) return "purple-brown";
  if (/sporata\s+(ruggine|bruno-ruggine|ocra-ruggine)/.test(text)) return "rust";
  if (/sporata\s+(rosa|rosata)/.test(text)) return "pink";
  if (/sporata\s+(bruna|bruno|tabacco)/.test(text)) return "brown";
  if (/sporata\s+(crema|rosato-crema)/.test(text)) return "cream";
  if (/sporata\s+bianca|spore?\s+bianche|leucospore/.test(text)) return "white";
  return "unknown";
}
function genericCharacters() {
  return [
    "Osservare e documentare cappello e imenoforo dell’esemplare.",
    "Osservare gambo e base completa, registrando eventuali veli e anello.",
    "Confrontare l’insieme dei caratteri con una descrizione documentata; questa voce non dispone di diagnosi taxon-specifica verificata.",
  ] as [string, string, string];
}
export function autoSummaryForAtlasTaxon(taxon: AtlasTaxon): AutoSummary {
  const minimum = minimumCards.find((card) => card.cardId === taxon.id)
    ?? minimumByCurrentName.get(normalizeName(taxon.scientificName));
  if (minimum && minimum.rank === taxon.rank) {
    const descriptive = publicDescriptiveCardContent(minimum);
    return {
      basis: "minimum-baseline",
      presentation: {
        primaryImageUrl: null, detailImageUrls: [],
        habitatSummary: descriptive.ecologySummary ?? "Ecologia della voce in attesa di revisione; il profilo 3+1 non ne certifica la verifica.",
        seasonSummary: "Stagionalità specifica da verificare nella fonte della voce; non generalizzata dal genere.",
        diagnosticCharacters: [...minimum.fieldProfile.characters] as [string, string, string],
        differentiatingCharacter: minimum.fieldProfile.plusOne,
        sporePrint: sporePrintFromTerminology(descriptive.terminology),
        representativeTaxon: minimum.rank === "species" ? null : "Profilo Minimo al rango " + minimum.rank + ": " + minimum.sourceLabel,
      },
    };
  }
  return {
    basis: "genus-context",
    presentation: {
      primaryImageUrl: null, detailImageUrls: [],
      habitatSummary: "Habitat non verificato per questa voce; non viene dedotto dal genere.",
      seasonSummary: "Stagionalità specifica non ancora verificata per questo taxon.",
      diagnosticCharacters: genericCharacters(), differentiatingCharacter: null,
      sporePrint: "unknown",
      representativeTaxon: "Contesto generale del genere/gruppo " + (taxon.parentScientificName || taxon.scientificName) + "; non sostituisce la diagnosi della specie.",
    },
  };
}
