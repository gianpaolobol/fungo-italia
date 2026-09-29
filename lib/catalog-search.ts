import { minimumCards } from "./minimum-cards.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import {
  genusNameIndex,
  minimumCardNavigation,
} from "./minimum-navigation.ts";
import { minimumNomenclatureMappings } from "./minimum-nomenclature.ts";
import type { EdibilityCategory } from "./minimum-card.ts";
import type { EvidenceReviewStatus } from "./catalog-evidence.ts";
import {
  publicAuditedFieldProfile,
  publicDescriptiveCardContent,
  publicEdibilityCategory,
} from "./public-scientific-policy.ts";
import { publicGenusLayer } from "./public-genus-policy.ts";

export type CatalogSearchKind = "minimumTaxon" | "teachingGroup";

export interface CatalogSearchDocument {
  id: string;
  kind: CatalogSearchKind;
  title: string;
  sourceLabel: string;
  rank: string;
  currentNames: string[];
  sourceNames: string[];
  genera: string[];
  edibilityCategory: EdibilityCategory | null;
  reviewStatus: EvidenceReviewStatus;
  parentTeachingCardId: string | null;
  searchText: string;
}

export type PublicCatalogSearchDocument = Omit<CatalogSearchDocument, "searchText">;

export interface CatalogSearchFilters {
  kind?: CatalogSearchKind | "all";
  rank?: string | null;
  edibilityCategory?: EdibilityCategory | null;
  genus?: string | null;
  reviewStatus?: EvidenceReviewStatus | null;
}

export interface CatalogSearchRequest {
  query?: string;
  filters?: CatalogSearchFilters;
  offset?: number;
  limit?: number;
}

export interface CatalogSearchResponse {
  total: number;
  offset: number;
  limit: number;
  items: CatalogSearchDocument[];
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it")
    .replace(/[._(),;:+/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function queryTokens(value: string) {
  return normalize(value)
    .split(" ")
    .filter(Boolean);
}

function tokenMatches(haystack: string, token: string) {
  if (token.length === 1) {
    return haystack.split(" ").some((word) => word.startsWith(token));
  }
  return haystack.includes(token);
}

function matchesQuery(document: CatalogSearchDocument, query: string) {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return true;
  const haystack = document.searchText;
  return tokens.every((token) => tokenMatches(haystack, token));
}

const nomenclatureByUnit = new Map(
  minimumNomenclatureMappings.map((mapping) => [mapping.sourceUnitId, mapping]),
);

const navigationByCard = new Map(
  minimumCardNavigation.map((entry) => [entry.cardId, entry]),
);

const genusAliasesByCard = new Map<string, Set<string>>();
for (const entry of genusNameIndex) {
  for (const cardId of entry.minimumCardIds) {
    const names = genusAliasesByCard.get(cardId) ?? new Set<string>();
    names.add(entry.name);
    genusAliasesByCard.set(cardId, names);
  }
}

function makeSearchText(values: readonly string[]) {
  return normalize(values.filter(Boolean).join(" "));
}

const minimumDocuments: CatalogSearchDocument[] = minimumCards.map((card) => {
  const mapping = nomenclatureByUnit.get(card.learningUnitId);
  const navigation = navigationByCard.get(card.cardId);
  if (!mapping || !navigation) {
    throw new Error(`Missing search metadata for ${card.cardId}`);
  }

  const genera = [...new Set([
    ...navigation.currentGenera,
    ...(genusAliasesByCard.get(card.cardId) ?? []),
  ])].sort((a, b) => a.localeCompare(b, "it"));

  const currentNames = [...mapping.currentAcceptedNames];
  const sourceNames = [card.sourceLabel, mapping.preferredDisplayName];
  const descriptive = publicDescriptiveCardContent(card);
  const fieldProfile = publicAuditedFieldProfile(card);

  return {
    id: card.cardId,
    kind: "minimumTaxon",
    title: card.displayName,
    sourceLabel: card.sourceLabel,
    rank: card.rank,
    currentNames,
    sourceNames,
    genera,
    edibilityCategory: publicEdibilityCategory(card),
    reviewStatus: card.reviewStatus,
    parentTeachingCardId: navigation.teachingCardId,
    searchText: makeSearchText([
      card.displayName,
      card.sourceLabel,
      ...currentNames,
      ...sourceNames,
      ...genera,
      ...descriptive.terminology,
      ...descriptive.essentialMorphology,
      ...fieldProfile.characters,
      fieldProfile.plusOne,
      fieldProfile.diagnosticNote ?? "",
      fieldProfile.safetyCheck ?? "",
      descriptive.ecologySummary ?? "",
    ]),
  };
});

const genusDocuments: CatalogSearchDocument[] = minimumGenusCards.map((card) => {
  const essential = publicGenusLayer(card, "essential");
  const deepening = publicGenusLayer(card, "deepening");
  const specialist = publicGenusLayer(card, "specialist");

  return {
    id: card.cardId,
    kind: "teachingGroup",
    title: card.displayTitle,
    sourceLabel: card.sourceLabel,
    rank: card.sourceRank,
    currentNames: [],
    sourceNames: [...card.sourceGenera],
    genera: [...new Set([...card.sourceGenera, ...card.currentGenera])].sort(
      (a, b) => a.localeCompare(b, "it"),
    ),
    edibilityCategory: null,
    reviewStatus: card.reviewStatus,
    parentTeachingCardId: null,
    searchText: makeSearchText([
      card.displayTitle,
      card.sourceLabel,
      ...card.sourceGenera,
      ...card.currentGenera,
      essential.objectiveSummary ?? "",
      ...essential.bullets,
      ...essential.taxonomyNotes,
      deepening.objectiveSummary ?? "",
      ...deepening.bullets,
      ...deepening.taxonomyNotes,
      specialist.objectiveSummary ?? "",
      ...specialist.bullets,
    ]),
  };
});

export const catalogSearchDocuments: CatalogSearchDocument[] = [
  ...genusDocuments,
  ...minimumDocuments,
];

function sameNormalized(left: string, right: string) {
  return normalize(left) === normalize(right);
}

function matchesFilters(
  document: CatalogSearchDocument,
  filters: CatalogSearchFilters,
) {
  if (filters.kind && filters.kind !== "all" && document.kind !== filters.kind) {
    return false;
  }
  if (filters.rank && !sameNormalized(document.rank, filters.rank)) {
    return false;
  }
  if (
    filters.edibilityCategory &&
    document.edibilityCategory !== filters.edibilityCategory
  ) {
    return false;
  }
  if (
    filters.genus &&
    !document.genera.some((genus) => sameNormalized(genus, filters.genus!))
  ) {
    return false;
  }
  if (
    filters.reviewStatus &&
    document.reviewStatus !== filters.reviewStatus
  ) {
    return false;
  }
  return true;
}

export function searchCatalog(
  request: CatalogSearchRequest = {},
): CatalogSearchResponse {
  const query = request.query ?? "";
  const filters = request.filters ?? {};
  const offset = Math.max(0, Math.trunc(request.offset ?? 0));
  const limit = Math.min(100, Math.max(1, Math.trunc(request.limit ?? 30)));

  const matched = catalogSearchDocuments
    .filter((document) => matchesFilters(document, filters))
    .filter((document) => matchesQuery(document, query))
    .sort((left, right) => (
      left.kind.localeCompare(right.kind) ||
      left.title.localeCompare(right.title, "it")
    ));

  return {
    total: matched.length,
    offset,
    limit,
    items: matched.slice(offset, offset + limit),
  };
}

export function parseCatalogSearchParams(params: URLSearchParams): CatalogSearchRequest {
  const limitRaw = Number(params.get("limit") ?? 30);
  const offsetRaw = Number(params.get("offset") ?? 0);
  const kind = params.get("kind");
  const edibility = params.get("edibility");

  return {
    query: params.get("q") ?? "",
    offset: Number.isFinite(offsetRaw) ? offsetRaw : 0,
    limit: Number.isFinite(limitRaw) ? limitRaw : 30,
    filters: {
      kind:
        kind === "minimumTaxon" || kind === "teachingGroup"
          ? kind
          : "all",
      rank: params.get("rank"),
      genus: params.get("genus"),
      reviewStatus: (params.get("reviewStatus") as EvidenceReviewStatus | null),
      edibilityCategory: edibility as EdibilityCategory | null,
    },
  };
}

export function toPublicCatalogSearchDocument(
  document: CatalogSearchDocument,
): PublicCatalogSearchDocument {
  const { searchText: _searchText, ...publicDocument } = document;
  return publicDocument;
}
