import sourcesJson from "../data/catalog/sources.json" with { type: "json" };
import trainingEvidenceJson from "../data/catalog/evidence.json" with { type: "json" };
import sourcePageIndexJson from "../data/catalog/source-page-index.json" with { type: "json" };
import objectives from "../data/taxonomic-objectives.json" with { type: "json" };

import type { Taxon } from "./domain.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import { minimumNomenclatureMappings } from "./minimum-nomenclature.ts";

export type SourceAuthorityRole =
  | "training"
  | "edibility"
  | "nomenclature"
  | "ecology"
  | "supplemental";

export type CatalogSourceType =
  | "courseDocument"
  | "book"
  | "article"
  | "database"
  | "institutionalWeb"
  | "expertReview";

export type EvidenceClaimType =
  | "taxonomy"
  | "training"
  | "edibility"
  | "treatment"
  | "ecology"
  | "association"
  | "phenology"
  | "geography"
  | "confusion"
  | "vernacularName";

export type EvidenceStrength =
  | "primaryExplicit"
  | "primaryInferred"
  | "secondaryCorroborated"
  | "expertAssessment"
  | "traditional"
  | "uncertain";

export type EvidenceReviewStatus =
  | "extracted"
  | "normalized"
  | "reviewNeeded"
  | "reviewed"
  | "approved"
  | "superseded"
  | "rejected";

export interface CatalogSource {
  sourceId: string;
  authorityRole: SourceAuthorityRole;
  sourceType: CatalogSourceType;
  title: string;
  authors: string[];
  contributors: string[];
  publisher: string | null;
  publicationYear: number | null;
  version: string | null;
  url: string | null;
  isbnOrDoi: string | null;
  accessedAt: string | null;
  licenseNote: string;
  fileHashSha256: string | null;
  assetStatus: "userLibrary" | "officialRemote" | "repository";
  reviewStatus: "approved" | "reviewed" | "reviewNeeded";
}

export interface CatalogEvidence {
  evidenceId: string;
  subjectType: "learningUnit" | "nomenclatureMapping" | "taxon" | "claim";
  subjectId: string;
  sourceId: string;
  sourceLocation: string;
  claimType: EvidenceClaimType;
  claimSummary: string;
  evidenceStrength: EvidenceStrength;
  extractedBy: string;
  extractedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewStatus: EvidenceReviewStatus;
  notes: string | null;
}

export interface SourcePageIndexRow {
  sourceHeadingId: string;
  sourceTaxonLabel: string;
  s1: { sourceId: string; page: number; location: string };
  s2: { sourceId: string; page: number; location: string };
}

export interface EvidenceValidationResult {
  ok: boolean;
  errors: string[];
  sourceCount: number;
  evidenceCount: number;
  trainingEvidenceCount: number;
  taxonomyEvidenceCount: number;
}

export const catalogSources = sourcesJson as CatalogSource[];
export const trainingEvidence = trainingEvidenceJson as CatalogEvidence[];
export const sourcePageIndex = sourcePageIndexJson as SourcePageIndexRow[];

const sourceIdForNomenclatureEvidence = {
  "index-fungorum": "source-nomenclature-index-fungorum",
  "peer-reviewed": "source-taxonomy-alvarado-2022-phalloideae",
  "source-s1": "source-s1-taxonomic-objectives-v4-2026-06-09",
  "species-fungorum": "source-nomenclature-species-fungorum",
} as const;

function taxonomySummary(mapping: (typeof minimumNomenclatureMappings)[number]) {
  if (mapping.status === "accepted") {
    return `${mapping.sourceLabel} è riconciliato con il taxon corrente ${mapping.currentAcceptedNames[0]}.`;
  }
  if (mapping.status === "definedSet") {
    return `La voce didattica ${mapping.sourceLabel} corrisponde a un insieme definito di taxa correnti: ${mapping.currentAcceptedNames.join(", ")}.`;
  }
  if (mapping.status === "sourceConcept") {
    return mapping.currentAcceptedNames.length > 0
      ? `Il concetto didattico ${mapping.sourceLabel} resta alla risoluzione S1; il nucleo nomenclaturale corrente include ${mapping.currentAcceptedNames.join(", ")}.`
      : `Il concetto didattico ${mapping.sourceLabel} resta alla risoluzione prescritta da S1 e non viene forzato a una specie corrente.`;
  }
  return `La riconciliazione nomenclaturale di ${mapping.sourceLabel} richiede revisione.`;
}

export const nomenclatureEvidence: CatalogEvidence[] = minimumNomenclatureMappings.flatMap(
  (mapping) => mapping.evidence.map((evidence, index) => {
    const sourceId = sourceIdForNomenclatureEvidence[evidence.source];
    return {
      evidenceId: `evidence-taxonomy-${mapping.sourceUnitId}-${String(index + 1).padStart(2, "0")}`,
      subjectType: "nomenclatureMapping",
      subjectId: mapping.sourceUnitId,
      sourceId,
      sourceLocation: evidence.recordId
        ? `record ${evidence.recordId}`
        : evidence.sourceUrl,
      claimType: evidence.source === "source-s1" ? "training" : "taxonomy",
      claimSummary: evidence.source === "source-s1"
        ? `S1 conserva ${mapping.sourceLabel} come concetto didattico alla risoluzione prevista dalla fonte.`
        : taxonomySummary(mapping),
      evidenceStrength: evidence.source === "source-s1"
        ? "primaryExplicit"
        : evidence.source === "peer-reviewed"
          ? "secondaryCorroborated"
          : "primaryExplicit",
      extractedBy: "pipeline:minimum-nomenclature",
      extractedAt: "2026-09-21T00:00:00Z",
      reviewedBy: null,
      reviewedAt: null,
      reviewStatus: mapping.status === "unresolved" || mapping.status === "conflict"
        ? "reviewNeeded"
        : "normalized",
      notes: evidence.note ?? mapping.notes ?? null,
    } satisfies CatalogEvidence;
  }),
);

export const allCatalogEvidence: CatalogEvidence[] = [
  ...trainingEvidence,
  ...nomenclatureEvidence,
];

function validDate(value: string | null) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value);
}

function sourceRoleRequiredForClaim(claimType: EvidenceClaimType): SourceAuthorityRole | null {
  if (claimType === "training") return "training";
  if (claimType === "taxonomy") return "nomenclature";
  if (claimType === "edibility" || claimType === "treatment") return "edibility";
  return null;
}

export function validateCatalogEvidence(
  sources: readonly CatalogSource[] = catalogSources,
  evidence: readonly CatalogEvidence[] = allCatalogEvidence,
  options: { requirePublishable?: boolean; requireCoreCoverage?: boolean } = {},
): EvidenceValidationResult {
  const requirePublishable = options.requirePublishable ?? false;
  const requireCoreCoverage = options.requireCoreCoverage ?? true;
  const errors: string[] = [];
  const sourcesById = new Map<string, CatalogSource>();
  const evidenceIds = new Set<string>();

  for (const source of sources) {
    if (!source.sourceId.trim()) errors.push("source with empty sourceId");
    if (sourcesById.has(source.sourceId)) errors.push(`duplicate sourceId: ${source.sourceId}`);
    sourcesById.set(source.sourceId, source);
    if (!source.title.trim()) errors.push(`${source.sourceId}: missing title`);
    if (!source.licenseNote.trim()) errors.push(`${source.sourceId}: missing license note`);
    if (source.assetStatus === "officialRemote") {
      if (!source.url?.startsWith("https://")) errors.push(`${source.sourceId}: official remote source requires https URL`);
      if (!validDate(source.accessedAt)) errors.push(`${source.sourceId}: remote source requires accessedAt`);
    }
    if (source.fileHashSha256 && !/^[a-f0-9]{64}$/i.test(source.fileHashSha256)) {
      errors.push(`${source.sourceId}: invalid SHA-256`);
    }
  }

  for (const item of evidence) {
    if (evidenceIds.has(item.evidenceId)) errors.push(`duplicate evidenceId: ${item.evidenceId}`);
    evidenceIds.add(item.evidenceId);
    const source = sourcesById.get(item.sourceId);
    if (!source) {
      errors.push(`${item.evidenceId}: unknown source ${item.sourceId}`);
      continue;
    }
    if (!item.subjectId.trim()) errors.push(`${item.evidenceId}: missing subjectId`);
    if (!item.sourceLocation.trim()) errors.push(`${item.evidenceId}: missing sourceLocation`);
    if (!item.claimSummary.trim()) errors.push(`${item.evidenceId}: missing claimSummary`);
    if (item.claimSummary.length > 500) errors.push(`${item.evidenceId}: claimSummary exceeds 500 characters`);
    if (!validDate(item.extractedAt)) errors.push(`${item.evidenceId}: invalid extractedAt`);

    const requiredRole = sourceRoleRequiredForClaim(item.claimType);
    if (requiredRole && source.authorityRole !== requiredRole) {
      errors.push(`${item.evidenceId}: ${item.claimType} claim must use ${requiredRole} authority, got ${source.authorityRole}`);
    }

    if (
      requirePublishable &&
      ["edibility", "treatment", "confusion"].includes(item.claimType) &&
      item.reviewStatus !== "approved"
    ) {
      errors.push(`${item.evidenceId}: sensitive claim is not approved for publication`);
    }
  }

  const evidenceBySubject = new Map<string, CatalogEvidence[]>();
  for (const item of evidence) {
    const key = `${item.subjectType}:${item.subjectId}`;
    const values = evidenceBySubject.get(key) ?? [];
    values.push(item);
    evidenceBySubject.set(key, values);
  }

  if (requireCoreCoverage) {
  for (const unit of sourceMinimumLearningUnits) {
    const records = evidenceBySubject.get(`learningUnit:${unit.id}`) ?? [];
    const training = records.filter((item) => item.claimType === "training");
    if (training.length !== 1) {
      errors.push(`${unit.id}: expected exactly one training evidence record, found ${training.length}`);
    } else {
      const item = training[0];
      if (item.sourceId !== "source-s1-taxonomic-objectives-v4-2026-06-09") {
        errors.push(`${unit.id}: training evidence is not sourced to S1`);
      }
      if (!item.sourceLocation.startsWith(`p. ${unit.sourcePage} `)) {
        errors.push(`${unit.id}: training evidence page drift`);
      }
    }
  }

  for (const mapping of minimumNomenclatureMappings) {
    const records = evidenceBySubject.get(`nomenclatureMapping:${mapping.sourceUnitId}`) ?? [];
    if (records.length !== mapping.evidence.length) {
      errors.push(
        `${mapping.sourceUnitId}: nomenclature evidence count ${records.length}; expected ${mapping.evidence.length}`,
      );
    }
    if (mapping.evidence.length === 0) {
      errors.push(`${mapping.sourceUnitId}: nomenclature mapping has no evidence`);
    }
  }
  }

  return {
    ok: errors.length === 0,
    errors,
    sourceCount: sources.length,
    evidenceCount: evidence.length,
    trainingEvidenceCount: evidence.filter((item) => item.claimType === "training").length,
    taxonomyEvidenceCount: evidence.filter((item) => item.claimType === "taxonomy").length,
  };
}

export function validateSourcePageIndex(
  rows: readonly SourcePageIndexRow[] = sourcePageIndex,
) {
  const errors: string[] = [];
  const byHeading = new Map(rows.map((row) => [row.sourceHeadingId, row]));
  if (rows.length !== objectives.length) {
    errors.push(`source page index has ${rows.length} rows; expected ${objectives.length}`);
  }

  for (const objective of objectives) {
    const row = byHeading.get(objective.id);
    if (!row) {
      errors.push(`${objective.id}: missing source page index row`);
      continue;
    }
    if (row.sourceTaxonLabel !== objective.scientificName) {
      errors.push(`${objective.id}: source label drift`);
    }
    if (row.s1.sourceId !== "source-s1-taxonomic-objectives-v4-2026-06-09") {
      errors.push(`${objective.id}: invalid S1 source id`);
    }
    if (row.s2.sourceId !== "source-s2-guida-commestibilita-2021") {
      errors.push(`${objective.id}: invalid S2 source id`);
    }
    if (row.s1.page !== objective.sources.minimumObjectives.page) {
      errors.push(`${objective.id}: S1 page drift`);
    }
    if (row.s2.page !== objective.sources.edibilityGuide.page) {
      errors.push(`${objective.id}: S2 page drift`);
    }
    if (row.s1.page <= 0 || row.s2.page <= 0) {
      errors.push(`${objective.id}: invalid source page`);
    }
  }

  return { ok: errors.length === 0, errors, rowCount: rows.length };
}

export const UNVERIFIED_EDIBILITY_NOTE =
  "Valutazione alimentare non ancora pubblicabile: manca un'evidenza S2 approvata collegata a questo taxon.";

export function hasApprovedClaimEvidence(
  subjectId: string,
  claimTypes: readonly EvidenceClaimType[],
  evidence: readonly CatalogEvidence[] = allCatalogEvidence,
) {
  return evidence.some(
    (item) =>
      item.subjectType === "taxon" &&
      item.subjectId === subjectId &&
      claimTypes.includes(item.claimType) &&
      item.reviewStatus === "approved",
  );
}

export function guardTaxonSensitiveFields<T extends Taxon>(
  taxon: T,
  evidence: readonly CatalogEvidence[] = allCatalogEvidence,
): T {
  const hasEdibility = hasApprovedClaimEvidence(
    taxon.id,
    ["edibility"],
    evidence,
  );
  if (hasEdibility) return taxon;

  return {
    ...taxon,
    edibility: "non-valutato",
    safetyNote: UNVERIFIED_EDIBILITY_NOTE,
  };
}

export function assertCatalogEvidencePublishable() {
  const evidence = validateCatalogEvidence(catalogSources, allCatalogEvidence, {
    requirePublishable: true,
  });
  const pages = validateSourcePageIndex();
  if (!evidence.ok || !pages.ok) {
    throw new Error([
      "Catalog evidence gate failed:",
      ...evidence.errors.map((error) => `- ${error}`),
      ...pages.errors.map((error) => `- ${error}`),
    ].join("\n"));
  }
  return { evidence, pages };
}
