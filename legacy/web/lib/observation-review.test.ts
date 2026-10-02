import assert from "node:assert/strict";
import test from "node:test";
import { canReviewObservation, observationStatusForOutcome, validateObservationReview } from "./observation-review.ts";
import type { ReviewerGrant } from "./catalog-permissions.ts";

const grant: ReviewerGrant = { userId: "reviewer", role: "mycologist", region: "Toscana", taxonomicGroup: "Amanita", active: true };
const target = { authorId: "author", region: "Toscana", taxonomicGroup: "Amanita" };
test("observation review enforces author independence and assigned scope", () => {
  assert.equal(canReviewObservation("reviewer", [grant], target), true);
  assert.equal(canReviewObservation("reviewer", [grant], { ...target, authorId: "reviewer" }), false);
  assert.equal(canReviewObservation("reviewer", [grant], { ...target, region: "Piemonte" }), false);
  assert.equal(canReviewObservation("reviewer", [grant], { ...target, taxonomicGroup: "Russula" }), false);
  assert.equal(canReviewObservation("reviewer", [{ ...grant, active: false }], target), false);
  assert.equal(canReviewObservation("impostor", [grant], target), false);
});
test("unknown locality and taxon require an unrestricted scientific assignment", () => {
  const unknown = { authorId: "author", region: null, taxonomicGroup: null };
  assert.equal(canReviewObservation("reviewer", [grant], unknown), false);
  assert.equal(canReviewObservation("reviewer", [{ ...grant, region: null, taxonomicGroup: null }], unknown), true);
  assert.equal(canReviewObservation("reviewer", [{ ...grant, role: "systemAdmin" }], unknown), false);
  assert.equal(canReviewObservation("reviewer", [{ ...grant, role: "scientificCurator" }], unknown), true);
});
test("a documented observation requires a taxon, rationale and exact review version", () => {
  const input = { observationId: "obs", outcome: "documented", notes: "Caratteri osservati nelle fotografie e limiti della determinazione.", expectedReviewVersion: 0, acceptedTaxonId: "taxon" };
  assert.deepEqual(validateObservationReview(input), []);
  for (const patch of [{ acceptedTaxonId: "" }, { expectedReviewVersion: -1 }, { expectedReviewVersion: 0.5 }, { notes: "ok" }, { outcome: "edible" }, { outcome: ["documented"] }]) {
    assert.ok(validateObservationReview({ ...input, ...patch }).length > 0);
  }
  assert.ok(validateObservationReview(null).length > 0);
});
test("requesting further evidence does not claim verification or edibility", () => {
  assert.equal(observationStatusForOutcome("documented"), "reviewed");
  assert.equal(observationStatusForOutcome("needsEvidence"), "needsEvidence");
  assert.deepEqual(validateObservationReview({ observationId: "obs", outcome: "needsEvidence", notes: "Servono fotografie nitide della base e dell'imenoforo.", expectedReviewVersion: 2 }), []);
});
