export type CatalogSourceType =
  | "courseDocument"
  | "book"
  | "article"
  | "database"
  | "institutionalWeb"
  | "expertReview";

export type ClaimType =
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

export interface CatalogSourceRecord {
  sourceId: string;
  sourceType: CatalogSourceType;
  title: string;
  authors: string[];
  publisher: string | null;
  publicationYear: number | null;
  version: string | null;
  url: string | null;
  isbnOrDoi: string | null;
  accessedAt: string | null;
  licenseNote: string;
  fileHashSha256: string | null;
}

export interface EvidenceRecord {
  evidenceId: string;
  sourceId: string;
  sourceLocation: string;
  claimType: ClaimType;
  claimSummary: string;
  evidenceStrength: EvidenceStrength;
  extractedBy: string;
  extractedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewStatus: EvidenceReviewStatus;
  notes: string | null;
}

export interface EvidenceValidationResult {
  ok: boolean;
  sourceCount: number;
  evidenceCount: number;
  errors: string[];
}

const webSourceTypes = new Set<CatalogSourceType>(["database", "institutionalWeb"]);

function isoDate(value: string | null) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value);
}

export function validateCatalogEvidence(
  sources: readonly CatalogSourceRecord[],
  evidence: readonly EvidenceRecord[],
): EvidenceValidationResult {
  const errors: string[] = [];
  const sourceIds = new Set<string>();
  const evidenceIds = new Set<string>();

  for (const source of sources) {
    if (!source.sourceId.trim()) errors.push("source with empty id");
    if (sourceIds.has(source.sourceId)) errors.push(`duplicate source id: ${source.sourceId}`);
    sourceIds.add(source.sourceId);

    if (!source.title.trim()) errors.push(`${source.sourceId}: missing title`);
    if (!source.licenseNote.trim()) errors.push(`${source.sourceId}: missing license note`);
    if (webSourceTypes.has(source.sourceType) && !isoDate(source.accessedAt)) {
      errors.push(`${source.sourceId}: web/database source requires accessedAt`);
    }
    if (
      source.fileHashSha256 !== null &&
      !/^[a-f0-9]{64}$/i.test(source.fileHashSha256)
    ) {
      errors.push(`${source.sourceId}: invalid SHA-256`);
    }
  }

  for (const item of evidence) {
    if (!item.evidenceId.trim()) errors.push("evidence with empty id");
    if (evidenceIds.has(item.evidenceId)) errors.push(`duplicate evidence id: ${item.evidenceId}`);
    evidenceIds.add(item.evidenceId);

    if (!sourceIds.has(item.sourceId)) {
      errors.push(`${item.evidenceId}: unknown source ${item.sourceId}`);
    }
    if (!item.sourceLocation.trim()) errors.push(`${item.evidenceId}: missing source location`);
    if (!item.claimSummary.trim()) errors.push(`${item.evidenceId}: missing claim summary`);
    if (!item.extractedBy.trim()) errors.push(`${item.evidenceId}: missing extractedBy`);
    if (!isoDate(item.extractedAt)) errors.push(`${item.evidenceId}: invalid extractedAt`);

    const reviewed = item.reviewStatus === "reviewed" || item.reviewStatus === "approved";
    if (reviewed && (!item.reviewedBy?.trim() || !isoDate(item.reviewedAt))) {
      errors.push(`${item.evidenceId}: reviewed/approved evidence requires reviewer and reviewedAt`);
    }
    if (!reviewed && (item.reviewedBy || item.reviewedAt)) {
      errors.push(`${item.evidenceId}: reviewer metadata present before reviewed status`);
    }
  }

  return {
    ok: errors.length === 0,
    sourceCount: sources.length,
    evidenceCount: evidence.length,
    errors,
  };
}

export function evidenceById(records: readonly EvidenceRecord[]) {
  return new Map(records.map((record) => [record.evidenceId, record]));
}

export function assertEvidenceIds(
  ownerId: string,
  ids: readonly string[],
  records: ReadonlyMap<string, EvidenceRecord>,
  options: {
    allowedClaimTypes?: readonly ClaimType[];
    minimumStatus?: "normalized" | "reviewed" | "approved";
  } = {},
) {
  const errors: string[] = [];
  if (ids.length === 0) errors.push(`${ownerId}: at least one evidence id is required`);

  const allowed = options.allowedClaimTypes
    ? new Set<ClaimType>(options.allowedClaimTypes)
    : null;
  const statusWeight: Record<EvidenceReviewStatus, number> = {
    extracted: 0,
    normalized: 1,
    reviewNeeded: 1,
    reviewed: 2,
    approved: 3,
    superseded: -1,
    rejected: -1,
  };
  const minimumWeight =
    options.minimumStatus === "approved"
      ? 3
      : options.minimumStatus === "reviewed"
        ? 2
        : options.minimumStatus === "normalized"
          ? 1
          : 0;

  for (const id of ids) {
    const record = records.get(id);
    if (!record) {
      errors.push(`${ownerId}: unknown evidence id ${id}`);
      continue;
    }
    if (allowed && !allowed.has(record.claimType)) {
      errors.push(`${ownerId}: evidence ${id} has incompatible claim type ${record.claimType}`);
    }
    if (statusWeight[record.reviewStatus] < minimumWeight) {
      errors.push(`${ownerId}: evidence ${id} is below required review status`);
    }
  }
  return errors;
}
