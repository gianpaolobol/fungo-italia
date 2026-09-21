import assessmentsJson from "../data/catalog/edibility-assessments.json" with { type: "json" };
import evidenceJson from "../data/catalog/edibility-evidence.json" with { type: "json" };

import { sourcePageIndex, type CatalogEvidence } from "./catalog-evidence.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";

export type EdibilityCategory =
  | "EDIBLE"
  | "EDIBLE_AFTER_TREATMENT"
  | "DISCOURAGED"
  | "NO_FOOD_VALUE"
  | "NOT_EDIBLE"
  | "POISONOUS"
  | "NOT_ASSESSED";

export type AssessmentScope =
  | "exactTaxon"
  | "section"
  | "group"
  | "aggregate"
  | "definedSet";

export type TreatmentCode =
  | "completeCooking"
  | "boilingAndDiscardWater"
  | "removeParts"
  | "youngSpecimensOnly"
  | "avoidAfterFreezing"
  | "avoidAlcohol"
  | "quantityLimit"
  | "otherSpecified";

export interface MinimumEdibilityAssessment {
  assessmentId: string;
  sourceUnitId: string;
  sourceLabel: string;
  category: EdibilityCategory;
  assessmentScope: AssessmentScope;
  scopeDefinition: string | null;
  conditionsSummary: string | null;
  treatmentCodes: TreatmentCode[];
  partsAllowed: string[];
  partsExcluded: string[];
  specimenStage: "anySuitable" | "youngOnly" | "notSpecified";
  specialWarnings: string[];
  sourceId: string;
  sourceLocation: string;
  evidenceIds: string[];
  reviewStatus:
    | "extracted"
    | "normalized"
    | "reviewNeeded"
    | "reviewed"
    | "approved"
    | "superseded"
    | "rejected";
}

export interface MinimumEdibilityValidation {
  ok: boolean;
  errors: string[];
  assessmentCount: number;
  evidenceCount: number;
  categoryCounts: Record<string, number>;
  treatmentAssessmentCount: number;
  approvedCount: number;
}

const categories = new Set<EdibilityCategory>([
  "EDIBLE",
  "EDIBLE_AFTER_TREATMENT",
  "DISCOURAGED",
  "NO_FOOD_VALUE",
  "NOT_EDIBLE",
  "POISONOUS",
  "NOT_ASSESSED",
]);

const scopes = new Set<AssessmentScope>([
  "exactTaxon",
  "section",
  "group",
  "aggregate",
  "definedSet",
]);

const treatmentCodes = new Set<TreatmentCode>([
  "completeCooking",
  "boilingAndDiscardWater",
  "removeParts",
  "youngSpecimensOnly",
  "avoidAfterFreezing",
  "avoidAlcohol",
  "quantityLimit",
  "otherSpecified",
]);

const S2 = "source-s2-guida-commestibilita-2021";

export const minimumEdibilityAssessments =
  assessmentsJson as MinimumEdibilityAssessment[];
export const minimumEdibilityEvidence =
  evidenceJson as CatalogEvidence[];

function pageFromLocation(value: string) {
  const match = value.match(/^p\.\s*(\d+)\b/);
  return match ? Number(match[1]) : null;
}

export function validateMinimumEdibility(
  assessments: readonly MinimumEdibilityAssessment[] = minimumEdibilityAssessments,
  evidence: readonly CatalogEvidence[] = minimumEdibilityEvidence,
  options: { requireApproved?: boolean } = {},
): MinimumEdibilityValidation {
  const requireApproved = options.requireApproved ?? false;
  const errors: string[] = [];
  const unitsById = new Map(sourceMinimumLearningUnits.map((unit) => [unit.id, unit]));
  const pageByHeading = new Map(sourcePageIndex.map((row) => [row.sourceHeadingId, row.s2.page]));
  const assessmentIds = new Set<string>();
  const byUnit = new Map<string, MinimumEdibilityAssessment[]>();
  const evidenceById = new Map<string, CatalogEvidence>();

  for (const item of evidence) {
    if (evidenceById.has(item.evidenceId)) {
      errors.push(`duplicate S2 evidence id: ${item.evidenceId}`);
    }
    evidenceById.set(item.evidenceId, item);
    if (item.sourceId !== S2) {
      errors.push(`${item.evidenceId}: edibility evidence must use S2`);
    }
    if (!["edibility", "treatment"].includes(item.claimType)) {
      errors.push(`${item.evidenceId}: invalid claim type ${item.claimType}`);
    }
    if (item.subjectType !== "claim") {
      errors.push(`${item.evidenceId}: S2 assessment evidence must target a claim`);
    }
    if (requireApproved && item.reviewStatus !== "approved") {
      errors.push(`${item.evidenceId}: evidence is not approved`);
    }
  }

  for (const assessment of assessments) {
    if (assessmentIds.has(assessment.assessmentId)) {
      errors.push(`duplicate assessment id: ${assessment.assessmentId}`);
    }
    assessmentIds.add(assessment.assessmentId);

    const unit = unitsById.get(assessment.sourceUnitId);
    if (!unit) {
      errors.push(`${assessment.assessmentId}: unknown source unit ${assessment.sourceUnitId}`);
      continue;
    }
    const existing = byUnit.get(unit.id) ?? [];
    existing.push(assessment);
    byUnit.set(unit.id, existing);

    if (assessment.sourceLabel !== unit.sourceLabel) {
      errors.push(`${assessment.assessmentId}: source label drift`);
    }
    if (!categories.has(assessment.category)) {
      errors.push(`${assessment.assessmentId}: invalid category ${assessment.category}`);
    }
    if (!scopes.has(assessment.assessmentScope)) {
      errors.push(`${assessment.assessmentId}: invalid scope ${assessment.assessmentScope}`);
    }
    if (assessment.assessmentScope === "exactTaxon" && assessment.scopeDefinition !== null) {
      errors.push(`${assessment.assessmentId}: exactTaxon must not have scopeDefinition`);
    }
    if (assessment.assessmentScope !== "exactTaxon" && !assessment.scopeDefinition?.trim()) {
      errors.push(`${assessment.assessmentId}: non-exact scope requires scopeDefinition`);
    }
    if (unit.requiredResolution === "species" && assessment.assessmentScope === "section") {
      errors.push(`${assessment.assessmentId}: species unit cannot be assessed as section`);
    }
    if (assessment.sourceId !== S2) {
      errors.push(`${assessment.assessmentId}: assessment must cite S2`);
    }

    const expectedPage = pageByHeading.get(unit.sourceHeadingId);
    const page = pageFromLocation(assessment.sourceLocation);
    if (!expectedPage || page !== expectedPage) {
      errors.push(
        `${assessment.assessmentId}: S2 page drift (${String(page)} vs ${String(expectedPage)})`,
      );
    }

    for (const code of assessment.treatmentCodes) {
      if (!treatmentCodes.has(code)) {
        errors.push(`${assessment.assessmentId}: invalid treatment code ${code}`);
      }
    }
    if (
      assessment.category === "EDIBLE_AFTER_TREATMENT" &&
      assessment.treatmentCodes.length === 0
    ) {
      errors.push(`${assessment.assessmentId}: conditional edibility requires treatment`);
    }
    if (
      assessment.category === "EDIBLE_AFTER_TREATMENT" &&
      !assessment.conditionsSummary?.trim()
    ) {
      errors.push(`${assessment.assessmentId}: conditional edibility requires conditions summary`);
    }
    if (
      assessment.category === "NOT_ASSESSED" &&
      !assessment.conditionsSummary?.trim()
    ) {
      errors.push(`${assessment.assessmentId}: NOT_ASSESSED requires an explicit coverage reason`);
    }

    const linked = assessment.evidenceIds.map((id) => evidenceById.get(id));
    if (linked.some((item) => !item)) {
      errors.push(`${assessment.assessmentId}: missing linked evidence`);
    }
    const edibilityClaims = linked.filter((item) => item?.claimType === "edibility");
    if (edibilityClaims.length !== 1) {
      errors.push(
        `${assessment.assessmentId}: expected exactly one edibility evidence, found ${edibilityClaims.length}`,
      );
    }
    const treatmentClaims = linked.filter((item) => item?.claimType === "treatment");
    if (assessment.treatmentCodes.length > 0 && treatmentClaims.length !== 1) {
      errors.push(
        `${assessment.assessmentId}: treatment codes require exactly one treatment evidence`,
      );
    }
    if (assessment.treatmentCodes.length === 0 && treatmentClaims.length !== 0) {
      errors.push(`${assessment.assessmentId}: unexpected treatment evidence`);
    }

    for (const linkedEvidence of linked) {
      if (!linkedEvidence) continue;
      if (linkedEvidence.subjectId !== assessment.assessmentId) {
        errors.push(`${assessment.assessmentId}: evidence subject drift ${linkedEvidence.evidenceId}`);
      }
      if (pageFromLocation(linkedEvidence.sourceLocation) !== expectedPage) {
        errors.push(`${linkedEvidence.evidenceId}: evidence page drift`);
      }
    }

    if (requireApproved && assessment.reviewStatus !== "approved") {
      errors.push(`${assessment.assessmentId}: assessment is not approved`);
    }
  }

  for (const unit of sourceMinimumLearningUnits) {
    const found = byUnit.get(unit.id) ?? [];
    if (found.length !== 1) {
      errors.push(`${unit.id}: expected exactly one S2 assessment, found ${found.length}`);
    }
  }

  for (const item of evidence) {
    if (!assessmentIds.has(item.subjectId)) {
      errors.push(`${item.evidenceId}: orphan S2 evidence subject ${item.subjectId}`);
    }
  }

  const categoryCounts: Record<string, number> = {};
  for (const assessment of assessments) {
    categoryCounts[assessment.category] =
      (categoryCounts[assessment.category] ?? 0) + 1;
  }

  return {
    ok: errors.length === 0,
    errors,
    assessmentCount: assessments.length,
    evidenceCount: evidence.length,
    categoryCounts,
    treatmentAssessmentCount: assessments.filter((item) => item.treatmentCodes.length > 0).length,
    approvedCount: assessments.filter((item) => item.reviewStatus === "approved").length,
  };
}

export function assertMinimumEdibilityExtracted() {
  const result = validateMinimumEdibility();
  if (!result.ok) {
    throw new Error(`Minimum edibility extraction gate failed:\n- ${result.errors.join("\n- ")}`);
  }
  return result;
}

export function assertMinimumEdibilityPublishable() {
  const result = validateMinimumEdibility(
    minimumEdibilityAssessments,
    minimumEdibilityEvidence,
    { requireApproved: true },
  );
  if (!result.ok) {
    throw new Error(`Minimum edibility publication gate failed:\n- ${result.errors.join("\n- ")}`);
  }
  return result;
}
