import { genusFromSourceLabel } from "./minimum-card-content.ts";
import type { MinimumAtlasCard } from "./minimum-card.ts";

export type MediaSearchScope = "exactTaxon" | "definedSetMember" | "representativeGenus";

export interface MinimumCardMediaQuery {
  term: string;
  scope: MediaSearchScope;
  label: string;
}

export function mediaQueriesForMinimumCard(
  card: MinimumAtlasCard,
): MinimumCardMediaQuery[] {
  if (card.currentAcceptedNames.length === 1) {
    return [{
      term: card.currentAcceptedNames[0],
      scope: card.rank === "species" ? "exactTaxon" : "definedSetMember",
      label: card.rank === "species" ? "Immagine del taxon" : "Immagine del nucleo nominale",
    }];
  }

  if (card.currentAcceptedNames.length > 1) {
    return card.currentAcceptedNames.map((name) => ({
      term: name,
      scope: "definedSetMember" as const,
      label: `Membro dell'insieme didattico: ${name}`,
    }));
  }

  const genus = genusFromSourceLabel(card.sourceLabel);
  if (!genus) return [];

  return [{
    term: genus,
    scope: "representativeGenus",
    label: `Immagine rappresentativa del genere ${genus}; non identifica il gruppo a specie`,
  }];
}
