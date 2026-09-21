import type { TaxonRank } from "./domain.ts";

export const COMPLETE_MINIMUM_UNIT_TARGET = 148;
export const CURRENT_MINIMUM_CONCEPT_TARGET = 141;

export type LearningLevel = "minimum" | "desirable" | "advanced";
export type LearningReviewStatus =
  | "extracted"
  | "normalized"
  | "reviewNeeded"
  | "reviewed"
  | "approved";

export interface LearningTaxonConcept {
  id: string;
  acceptedScientificName: string;
  rank: TaxonRank;
  aliases: string[];
}

export interface LearningUnit {
  id: string;
  sourceHeadingId: string;
  sourceLabel: string;
  sourcePage: number;
  level: LearningLevel;
  requiredResolution: TaxonRank;
  currentConceptId: string;
  deepMorphologyRequired: boolean;
  reviewStatus: LearningReviewStatus;
  notes?: string;
}

export interface LearningInventoryValidation {
  ok: boolean;
  unitCount: number;
  conceptCount: number;
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
  concepts: readonly LearningTaxonConcept[],
  options: {
    expectedUnits?: number;
    expectedConcepts?: number;
    requireApproved?: boolean;
  } = {},
): LearningInventoryValidation {
  const expectedUnits = options.expectedUnits ?? COMPLETE_MINIMUM_UNIT_TARGET;
  const expectedConcepts = options.expectedConcepts ?? CURRENT_MINIMUM_CONCEPT_TARGET;
  const requireApproved = options.requireApproved ?? false;
  const errors: string[] = [];

  if (units.length !== expectedUnits) {
    errors.push(`minimum unit count ${units.length}; expected ${expectedUnits}`);
  }

  const unitIds = new Set<string>();
  const conceptIds = new Set(concepts.map((concept) => concept.id));
  const referencedConceptIds = new Set<string>();

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

    if (!conceptIds.has(unit.currentConceptId)) {
      errors.push(`${unit.id}: missing current concept ${unit.currentConceptId}`);
    } else {
      referencedConceptIds.add(unit.currentConceptId);
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

  const conceptIdsSeen = new Set<string>();
  for (const concept of concepts) {
    if (!concept.id.trim()) errors.push("concept with empty id");
    if (!concept.acceptedScientificName.trim()) {
      errors.push(`${concept.id || "<empty>"}: missing accepted scientific name`);
    }
    if (conceptIdsSeen.has(concept.id)) errors.push(`duplicate concept id: ${concept.id}`);
    conceptIdsSeen.add(concept.id);
  }

  if (referencedConceptIds.size !== expectedConcepts) {
    errors.push(
      `current concept count ${referencedConceptIds.size}; expected ${expectedConcepts}`,
    );
  }

  return {
    ok: errors.length === 0,
    unitCount: units.length,
    conceptCount: referencedConceptIds.size,
    errors,
  };
}

export function assertMinimumLearningInventory(
  units: readonly LearningUnit[],
  concepts: readonly LearningTaxonConcept[],
  options: {
    expectedUnits?: number;
    expectedConcepts?: number;
    requireApproved?: boolean;
  } = {},
) {
  const result = validateMinimumLearningInventory(units, concepts, options);
  if (!result.ok) {
    throw new Error(`Invalid minimum learning inventory:\n- ${result.errors.join("\n- ")}`);
  }
  return result;
}
