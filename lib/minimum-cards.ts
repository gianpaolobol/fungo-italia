import {
  draftConfusionsForSourceLabel,
  profileForSourceLabel,
} from "./minimum-card-content.ts";
import { provisionalSafetyForSourceLabel } from "./minimum-card-safety.ts";
import { fieldProfileForSourceLabel } from "./minimum-field-profiles.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import { minimumNomenclatureMappings } from "./minimum-nomenclature.ts";
import type { MinimumAtlasCard } from "./minimum-card.ts";

const nomenclatureByUnit = new Map(
  minimumNomenclatureMappings.map((mapping) => [mapping.sourceUnitId, mapping]),
);

export const minimumCards: MinimumAtlasCard[] = sourceMinimumLearningUnits.map((unit) => {
  const mapping = nomenclatureByUnit.get(unit.id);
  if (!mapping) {
    throw new Error(`Missing nomenclature mapping for ${unit.id}`);
  }

  const profile = profileForSourceLabel(unit.sourceLabel);
  const safety = provisionalSafetyForSourceLabel(unit.sourceLabel);
  const fieldProfile = fieldProfileForSourceLabel(unit.sourceLabel);
  if (!fieldProfile) {
    throw new Error(`Missing audited field profile for ${unit.sourceLabel}`);
  }
  const draftConfusions = draftConfusionsForSourceLabel(unit.sourceLabel);

  const confusionWarnings = draftConfusions.map((confusion, index) => ({
    ...confusion,
    claimIds: [`claim-confusion-${unit.id}-${index + 1}`],
  }));

  const claimIds = [
    `claim-training-${unit.id}`,
    `claim-field-profile-${unit.id}`,
    `claim-morphology-${unit.id}`,
    `claim-ecology-${unit.id}`,
    `claim-edibility-draft-${unit.id}`,
    ...confusionWarnings.flatMap((confusion) => confusion.claimIds),
  ];

  return {
    cardId: `minimum-card-${unit.id}`,
    learningUnitId: unit.id,
    depth: "minimum",
    displayName: mapping.preferredDisplayName,
    sourceLabel: unit.sourceLabel,
    rank: unit.requiredResolution,
    currentAcceptedNames: mapping.currentAcceptedNames,
    terminology: profile.terminology,
    essentialMorphology: profile.morphology,
    fieldProfile,
    ecologySummary: profile.ecology,
    confusionWarnings,
    edibilityCategory: safety.category,
    treatmentCodes: safety.treatmentCodes,
    safetySummary: safety.summary,
    claimIds,
    reviewStatus: "reviewNeeded",
  };
});
