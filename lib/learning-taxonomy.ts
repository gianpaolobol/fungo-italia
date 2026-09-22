import type { TaxonRank } from "./domain.ts";

export const COMPLETE_MINIMUM_UNIT_TARGET = 148;

/**
 * Historical planning number retained only for audit traceability.
 * It was not backed by a reproducible 148 -> 141 reconciliation and therefore
 * MUST NOT be used as a release invariant.
 */
export const LEGACY_PROVISIONAL_CURRENT_CONCEPT_TARGET = 141;

export type LearningLevel = "minimum" | "desirable" | "advanced";
export type LearningReviewStatus =
  | "extracted"
  | "normalized"
  | "reviewNeeded"
  | "reviewed"
  | "approved";

export interface LearningUnit {
  id: string;
  sourceHeadingId: string;
  sourceLabel: string;
  sourcePage: number;
  level: LearningLevel;
  requiredResolution: TaxonRank;
  deepMorphologyRequired: boolean;
  reviewStatus: LearningReviewStatus;
  notes?: string;
}

export type NomenclatureMappingStatus =
  | "accepted"
  | "sourceConcept"
  | "definedSet"
  | "conflict"
  | "unresolved";

export interface NomenclatureEvidence {
  source: "index-fungorum" | "species-fungorum" | "peer-reviewed" | "source-s1";
  sourceUrl: string;
  checkedAt: string;
  recordId?: string;
  queryName?: string;
  expectedCurrentName?: string;
  note?: string;
}

export interface LearningNomenclatureMapping {
  sourceUnitId: string;
  sourceLabel: string;
  status: NomenclatureMappingStatus;
  /**
   * Current accepted formal taxa when the source unit can be reconciled.
   * A source concept (section/group/s.l.) may intentionally have none.
   */
  currentAcceptedNames: string[];
  preferredDisplayName: string;
  evidence: NomenclatureEvidence[];
  notes?: string;
}

export interface LearningInventoryValidation {
  ok: boolean;
  unitCount: number;
  errors: string[];
}

export interface LearningInventoryValidationOptions {
  expectedUnits?: number;
  requireApproved?: boolean;
}

export interface NomenclatureValidation {
  ok: boolean;
  sourceUnitCount: number;
  mappingCount: number;
  acceptedCount: number;
  sourceConceptCount: number;
  definedSetCount: number;
  conflictCount: number;
  unresolvedCount: number;
  errors: string[];
}

const forbiddenParserArtifacts = new Set([
  "Armillaria come",
  "Boletus sez",
  "Cortinarius sez",
  "Hydnaceae repandum",
  "Leccinum tutte",
  "Phallaceae per",
  "Ramaria colorate",
  "Ramaria definite",
  "Volvariella per",
]);

function normalizedLabel(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function validateMinimumLearningInventory(
  units: readonly LearningUnit[],
  options: LearningInventoryValidationOptions = {},
): LearningInventoryValidation {
  const expectedUnits = options.expectedUnits ?? COMPLETE_MINIMUM_UNIT_TARGET;
  const requireApproved = options.requireApproved ?? false;
  const errors: string[] = [];

  if (units.length !== expectedUnits) {
    errors.push(`minimum unit count ${units.length}; expected ${expectedUnits}`);
  }

  const unitIds = new Set<string>();
  for (const unit of units) {
    if (unitIds.has(unit.id)) errors.push(`duplicate learning unit id: ${unit.id}`);
    unitIds.add(unit.id);

    if (unit.level !== "minimum") {
      errors.push(`${unit.id}: level must be minimum in the minimum inventory`);
    }
    if (!Number.isInteger(unit.sourcePage) || unit.sourcePage <= 0) {
      errors.push(`${unit.id}: invalid source page`);
    }
    if (!unit.sourceHeadingId.trim()) {
      errors.push(`${unit.id}: missing source heading id`);
    }
    if (!unit.sourceLabel.trim()) {
      errors.push(`${unit.id}: missing source label`);
    }

    const label = normalizedLabel(unit.sourceLabel);
    if (forbiddenParserArtifacts.has(label)) {
      errors.push(`${unit.id}: parser prose artifact leaked into inventory: ${label}`);
    }

    if (requireApproved && unit.reviewStatus !== "approved") {
      errors.push(`${unit.id}: minimum unit is not approved`);
    }

    if (/\bs\.?\s*l\.?\b/i.test(label) && unit.requiredResolution === "species") {
      errors.push(`${unit.id}: sensu-lato unit cannot be flattened to species`);
    }
    if (/\bsez\.?\b/i.test(label) && unit.requiredResolution !== "section") {
      errors.push(`${unit.id}: section unit must keep section resolution`);
    }
    if (/\bsottogenere\b/i.test(label) && unit.requiredResolution !== "subgenus") {
      errors.push(`${unit.id}: subgenus unit must keep subgenus resolution`);
    }
  }

  return {
    ok: errors.length === 0,
    unitCount: units.length,
    errors,
  };
}

export function validateMinimumNomenclatureMappings(
  units: readonly LearningUnit[],
  mappings: readonly LearningNomenclatureMapping[],
  options: { requirePublishable?: boolean } = {},
): NomenclatureValidation {
  const requirePublishable = options.requirePublishable ?? false;
  const errors: string[] = [];
  const sourceIds = new Set(units.map((unit) => unit.id));
  const mappingIds = new Set<string>();

  for (const mapping of mappings) {
    if (mappingIds.has(mapping.sourceUnitId)) {
      errors.push(`duplicate mapping for ${mapping.sourceUnitId}`);
    }
    mappingIds.add(mapping.sourceUnitId);

    if (!sourceIds.has(mapping.sourceUnitId)) {
      errors.push(`mapping references unknown source unit ${mapping.sourceUnitId}`);
    }
    const sourceUnit = units.find((unit) => unit.id === mapping.sourceUnitId);
    if (sourceUnit && normalizedLabel(sourceUnit.sourceLabel) !== normalizedLabel(mapping.sourceLabel)) {
      errors.push(`${mapping.sourceUnitId}: source label drift`);
    }
    if (!mapping.preferredDisplayName.trim()) {
      errors.push(`${mapping.sourceUnitId}: missing preferred display name`);
    }
    if (mapping.evidence.length === 0) {
      errors.push(`${mapping.sourceUnitId}: nomenclature mapping has no evidence`);
    }

    const acceptedNames = new Set(mapping.currentAcceptedNames.map(normalizedLabel));
    if (acceptedNames.size !== mapping.currentAcceptedNames.length) {
      errors.push(`${mapping.sourceUnitId}: duplicate current accepted name`);
    }

    if (mapping.status === "accepted" && mapping.currentAcceptedNames.length !== 1) {
      errors.push(`${mapping.sourceUnitId}: accepted mapping must resolve to exactly one current taxon`);
    }
    if (mapping.status === "definedSet" && mapping.currentAcceptedNames.length < 2) {
      errors.push(`${mapping.sourceUnitId}: defined set must contain at least two current taxa`);
    }
    if (mapping.status === "conflict" && mapping.currentAcceptedNames.length < 2) {
      errors.push(`${mapping.sourceUnitId}: conflict must expose the competing current taxa`);
    }
    if (
      mapping.status === "sourceConcept" &&
      sourceUnit?.requiredResolution === "species" &&
      mapping.currentAcceptedNames.length <= 1
    ) {
      errors.push(`${mapping.sourceUnitId}: a species source unit cannot silently become a source-only concept`);
    }

    if (
      requirePublishable &&
      (mapping.status === "unresolved" || mapping.status === "conflict")
    ) {
      errors.push(`${mapping.sourceUnitId}: ${mapping.status} mapping blocks publication`);
    }
  }

  for (const unit of units) {
    if (!mappingIds.has(unit.id)) {
      errors.push(`${unit.id}: missing nomenclature mapping`);
    }
  }

  const counts = {
    acceptedCount: mappings.filter((mapping) => mapping.status === "accepted").length,
    sourceConceptCount: mappings.filter((mapping) => mapping.status === "sourceConcept").length,
    definedSetCount: mappings.filter((mapping) => mapping.status === "definedSet").length,
    conflictCount: mappings.filter((mapping) => mapping.status === "conflict").length,
    unresolvedCount: mappings.filter((mapping) => mapping.status === "unresolved").length,
  };

  return {
    ok: errors.length === 0,
    sourceUnitCount: units.length,
    mappingCount: mappings.length,
    ...counts,
    errors,
  };
}

export function assertMinimumLearningInventory(
  units: readonly LearningUnit[],
  options: LearningInventoryValidationOptions = {},
) {
  const result = validateMinimumLearningInventory(units, options);
  if (!result.ok) {
    throw new Error(`Invalid minimum learning inventory:\n- ${result.errors.join("\n- ")}`);
  }
  return result;
}

export function assertMinimumNomenclatureMappings(
  units: readonly LearningUnit[],
  mappings: readonly LearningNomenclatureMapping[],
  options: { requirePublishable?: boolean } = {},
) {
  const result = validateMinimumNomenclatureMappings(units, mappings, options);
  if (!result.ok) {
    throw new Error(`Invalid minimum nomenclature mapping:\n- ${result.errors.join("\n- ")}`);
  }
  return result;
}
