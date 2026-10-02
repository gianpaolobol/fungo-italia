import { hasEditorialScope, type ReviewerGrant } from "./catalog-permissions.ts";

export type ObservationReviewOutcome = "documented" | "needsEvidence" | "rejected";
export type ObservationReviewTarget = {
  authorId: string;
  region: string | null;
  taxonomicGroup: string | null;
};
export function canReviewObservation(actorId: string, grants: readonly ReviewerGrant[], target: ObservationReviewTarget) {
  return actorId !== target.authorId && hasEditorialScope(
    grants.filter(grant => grant.userId === actorId && grant.active),
    target.region, target.taxonomicGroup,
  );
}
export function observationStatusForOutcome(outcome: ObservationReviewOutcome) {
  return outcome === "documented" ? "reviewed" : outcome;
}
export function validateObservationReview(input: unknown) {
  if (!input || typeof input !== "object") return ["Decisione non valida."];
  const value = input as Record<string, unknown>;
  const errors: string[] = [];
  if (typeof value.observationId !== "string" || !value.observationId.trim()) errors.push("Osservazione richiesta.");
  if (typeof value.outcome !== "string" || !["documented", "needsEvidence", "rejected"].includes(value.outcome)) errors.push("Esito non valido.");
  if (typeof value.notes !== "string" || value.notes.trim().length < 20 || value.notes.length > 20000) errors.push("Motiva la decisione con 20–20000 caratteri.");
  if (!Number.isInteger(value.expectedReviewVersion) || Number(value.expectedReviewVersion) < 0) errors.push("Versione della revisione richiesta.");
  if (value.outcome === "documented" && (typeof value.acceptedTaxonId !== "string" || !value.acceptedTaxonId.trim())) errors.push("Indica il taxon documentato.");
  if (value.acceptedTaxonId !== undefined && value.acceptedTaxonId !== null && typeof value.acceptedTaxonId !== "string") errors.push("Taxon non valido.");
  return errors;
}
