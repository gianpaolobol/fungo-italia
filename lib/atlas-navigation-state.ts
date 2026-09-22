import type { CatalogSearchKind } from "./catalog-search.ts";
import type { EdibilityCategory } from "./minimum-card.ts";
import type { EvidenceReviewStatus } from "./catalog-evidence.ts";

export type AtlasDepth = "essential" | "deepening" | "specialist";
export type AtlasSelectionKind = "minimumTaxon" | "teachingGroup";

export interface AtlasNavigationState {
  query: string;
  kind: CatalogSearchKind | "all";
  rank: string;
  genus: string;
  edibility: EdibilityCategory | "";
  reviewStatus: EvidenceReviewStatus | "";
  selectedKind: AtlasSelectionKind | null;
  selectedId: string | null;
  depth: AtlasDepth;
  returnKind: AtlasSelectionKind | null;
  returnId: string | null;
  returnDepth: AtlasDepth;
}

export const defaultAtlasNavigationState: AtlasNavigationState = {
  query: "",
  kind: "all",
  rank: "",
  genus: "",
  edibility: "",
  reviewStatus: "",
  selectedKind: null,
  selectedId: null,
  depth: "essential",
  returnKind: null,
  returnId: null,
  returnDepth: "essential",
};

const kinds = new Set(["all", "minimumTaxon", "teachingGroup"]);
const selectionKinds = new Set(["minimumTaxon", "teachingGroup"]);
const depths = new Set(["essential", "deepening", "specialist"]);
const edibility = new Set([
  "EDIBLE",
  "EDIBLE_AFTER_TREATMENT",
  "DISCOURAGED",
  "NO_FOOD_VALUE",
  "NOT_EDIBLE",
  "POISONOUS",
  "NOT_ASSESSED",
]);
const reviewStatuses = new Set([
  "extracted",
  "normalized",
  "reviewNeeded",
  "reviewed",
  "approved",
  "superseded",
  "rejected",
]);

function enumValue<T extends string>(
  value: string | null,
  allowed: ReadonlySet<string>,
  fallback: T,
): T {
  return value && allowed.has(value) ? value as T : fallback;
}

export function parseAtlasNavigationState(params: URLSearchParams): AtlasNavigationState {
  const selectedKind = enumValue<AtlasSelectionKind | "">(
    params.get("selectedKind"),
    selectionKinds,
    "",
  );
  const selectedId = params.get("selectedId")?.trim() || null;
  const returnKind = enumValue<AtlasSelectionKind | "">(
    params.get("returnKind"),
    selectionKinds,
    "",
  );
  const returnId = params.get("returnId")?.trim() || null;

  return {
    query: params.get("q") ?? "",
    kind: enumValue(params.get("kind"), kinds, "all"),
    rank: params.get("rank") ?? "",
    genus: params.get("genus") ?? "",
    edibility: enumValue<EdibilityCategory | "">(
      params.get("edibility"),
      edibility,
      "",
    ),
    reviewStatus: enumValue<EvidenceReviewStatus | "">(
      params.get("reviewStatus"),
      reviewStatuses,
      "",
    ),
    selectedKind: selectedKind || null,
    selectedId: selectedKind && selectedId ? selectedId : null,
    depth: enumValue(params.get("depth"), depths, "essential"),
    returnKind: returnKind || null,
    returnId: returnKind && returnId ? returnId : null,
    returnDepth: enumValue(params.get("returnDepth"), depths, "essential"),
  };
}

export function serializeAtlasNavigationState(
  state: AtlasNavigationState,
): URLSearchParams {
  const params = new URLSearchParams();

  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.kind !== "all") params.set("kind", state.kind);
  if (state.rank) params.set("rank", state.rank);
  if (state.genus) params.set("genus", state.genus);
  if (state.edibility) params.set("edibility", state.edibility);
  if (state.reviewStatus) params.set("reviewStatus", state.reviewStatus);

  if (state.selectedKind && state.selectedId) {
    params.set("selectedKind", state.selectedKind);
    params.set("selectedId", state.selectedId);
    if (state.depth !== "essential") params.set("depth", state.depth);
  }

  if (state.returnKind && state.returnId) {
    params.set("returnKind", state.returnKind);
    params.set("returnId", state.returnId);
    if (state.returnDepth !== "essential") params.set("returnDepth", state.returnDepth);
  }

  return params;
}

export function selectAtlasCard(
  state: AtlasNavigationState,
  selection: {
    kind: AtlasSelectionKind;
    id: string;
    depth?: AtlasDepth;
    returnToCurrent?: boolean;
  },
): AtlasNavigationState {
  const captureReturn =
    selection.returnToCurrent &&
    state.selectedKind !== null &&
    state.selectedId !== null;

  return {
    ...state,
    selectedKind: selection.kind,
    selectedId: selection.id,
    depth: selection.depth ?? "essential",
    returnKind: captureReturn ? state.selectedKind : null,
    returnId: captureReturn ? state.selectedId : null,
    returnDepth: captureReturn ? state.depth : "essential",
  };
}

export function closeAtlasCard(state: AtlasNavigationState): AtlasNavigationState {
  return {
    ...state,
    selectedKind: null,
    selectedId: null,
    depth: "essential",
    returnKind: null,
    returnId: null,
    returnDepth: "essential",
  };
}

export function setAtlasDepth(
  state: AtlasNavigationState,
  depth: AtlasDepth,
): AtlasNavigationState {
  if (!state.selectedId || !state.selectedKind) {
    return { ...state, depth: "essential" };
  }
  return { ...state, depth };
}

export function atlasStateHref(
  pathname: string,
  state: AtlasNavigationState,
) {
  const query = serializeAtlasNavigationState(state).toString();
  return query ? `${pathname}?${query}` : pathname;
}


export function returnToAtlasParent(
  state: AtlasNavigationState,
): AtlasNavigationState {
  if (!state.returnKind || !state.returnId) {
    return closeAtlasCard(state);
  }

  return {
    ...state,
    selectedKind: state.returnKind,
    selectedId: state.returnId,
    depth: state.returnDepth,
    returnKind: null,
    returnId: null,
    returnDepth: "essential",
  };
}
