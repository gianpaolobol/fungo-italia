import type { AtlasTaxon, TaxonRank } from "./domain.ts";
import { reviewedSummaryCardContent } from "./summary-card-content.ts";
import { autoSummaryForAtlasTaxon } from "./summary-card-auto.ts";

export type SporePrintToken =
  | "white"
  | "cream"
  | "pale-yellow"
  | "ochre"
  | "pink"
  | "salmon"
  | "rust"
  | "brown"
  | "olive-brown"
  | "purple-brown"
  | "black"
  | "variable"
  | "unknown"
  | "not-applicable";

export type SummaryCardStatus = "ready" | "preparing" | "source-gap";
export type SummaryCardBasis = "atlas-only" | "reviewed-taxon" | "minimum-baseline" | "genus-context";

export interface SummaryCardPresentation {
  primaryImageUrl: string | null;
  detailImageUrls: string[];
  habitatSummary: string | null;
  seasonSummary: string | null;
  diagnosticCharacters: [string, string, string] | null;
  differentiatingCharacter: string | null;
  sporePrint: SporePrintToken;
  representativeTaxon: string | null;
}

export interface SummaryCard {
  id: string;
  atlasId: string;
  atlasTarget: {
    id: string;
    rank: TaxonRank;
  };
  commonName: string;
  displayCommonName: string;
  scientificName: string;
  acceptedName: string;
  rank: TaxonRank;
  classification: {
    kingdom: "Fungi";
    division: AtlasTaxon["division"];
    className: string;
    order: string;
    family: string | null;
  };
  parentScientificName: string;
  edibility: AtlasTaxon["edibility"];
  safetyNote: string;
  reviewStatus: SummaryCardStatus;
  basis: SummaryCardBasis;
  presentation: SummaryCardPresentation;
}

/**
 * S0 projection only.
 *
 * Scientific identity, nomenclature, rank, classification and edibility are
 * copied from the Atlas record. Presentation fields intentionally remain
 * unfilled until a reviewed Schede content record exists.
 */
export function projectAtlasTaxonToSummaryCard(taxon: AtlasTaxon): SummaryCard {
  return {
    id: `scheda-${taxon.id}`,
    atlasId: taxon.id,
    atlasTarget: {
      id: taxon.id,
      rank: taxon.rank,
    },
    commonName: taxon.commonName,
    displayCommonName: taxon.commonName,
    scientificName: taxon.scientificName,
    acceptedName: taxon.acceptedName,
    rank: taxon.rank,
    classification: {
      kingdom: taxon.kingdom,
      division: taxon.division,
      className: taxon.className,
      order: taxon.order,
      family: taxon.family,
    },
    parentScientificName: taxon.parentScientificName,
    edibility: taxon.edibility,
    safetyNote: taxon.safetyNote,
    reviewStatus: "preparing",
    basis: "atlas-only",
    presentation: {
      primaryImageUrl: null,
      detailImageUrls: [],
      habitatSummary: null,
      seasonSummary: null,
      diagnosticCharacters: null,
      differentiatingCharacter: null,
      sporePrint: "unknown",
      representativeTaxon: null,
    },
  };
}

function reviewedContentForTaxon(taxon: AtlasTaxon) {
  const direct = reviewedSummaryCardContent[taxon.id];
  if (direct) return direct;
  const canonicalAtlasId =
    "atlas-" +
    taxon.scientificName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("it")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return reviewedSummaryCardContent[canonicalAtlasId];
}

export function buildSummaryCardIndex(
  taxa: readonly AtlasTaxon[],
): SummaryCard[] {
  return taxa.map((taxon) => {
    const base = projectAtlasTaxonToSummaryCard(taxon);
    const automatic = autoSummaryForAtlasTaxon(taxon);
    const reviewed = reviewedContentForTaxon(taxon);

    if (reviewed) {
      return {
        ...base,
        displayCommonName: reviewed.displayCommonName,
        reviewStatus: "ready",
        basis: "reviewed-taxon",
        presentation: {
          ...automatic.presentation,
          ...reviewed.presentation,
        },
      };
    }

    return {
      ...base,
      reviewStatus: automatic.basis === "minimum-baseline" ? "preparing" : "source-gap",
      basis: automatic.basis,
      presentation: {
        ...base.presentation,
        ...automatic.presentation,
      },
    };
  });
}

export function findSummaryCardByAtlasId(
  cards: readonly SummaryCard[],
  atlasId: string,
): SummaryCard | null {
  return cards.find((card) => card.atlasId === atlasId) ?? null;
}

export function isSummaryCardReady(card: SummaryCard): boolean {
  const p = card.presentation;
  return (
    card.reviewStatus === "ready" &&
    Boolean(p.primaryImageUrl) &&
    Boolean(p.habitatSummary) &&
    Boolean(p.seasonSummary) &&
    Boolean(p.diagnosticCharacters) &&
    p.sporePrint !== "unknown"
  );
}

export function isSummaryCardContentReady(card: SummaryCard): boolean {
  const p = card.presentation;
  return (
    card.reviewStatus === "ready" &&
    Boolean(p.habitatSummary) &&
    Boolean(p.seasonSummary) &&
    Boolean(p.diagnosticCharacters) &&
    Boolean(p.differentiatingCharacter) &&
    p.sporePrint !== "unknown"
  );
}
