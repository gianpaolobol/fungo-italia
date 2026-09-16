import assert from "node:assert/strict";
import test from "node:test";

import {
  canApproveCriticalChange,
  canReviewChange,
  hasEditorialScope,
  resolveBootstrapRole,
  type ReviewerGrant,
} from "./catalog-permissions.ts";

const change = {
  id: "change-1",
  authorId: "collector-1",
  criticality: "ordinary" as const,
  regionScope: "Emilia-Romagna",
  taxonomicScope: "Russulaceae",
};

test("micologist grant must match both regional and taxonomic scope", () => {
  const matching: ReviewerGrant[] = [{
    userId: "m1",
    role: "mycologist",
    region: "Emilia-Romagna",
    taxonomicGroup: "Russulaceae",
    active: true,
  }];
  const wrongRegion = [{ ...matching[0], region: "Toscana" }];
  const wrongGroup = [{ ...matching[0], taxonomicGroup: "Boletaceae" }];
  assert.equal(canReviewChange(matching, change), true);
  assert.equal(canReviewChange(wrongRegion, change), false);
  assert.equal(canReviewChange(wrongGroup, change), false);
});

test("national curator can review any scope but never their own change", () => {
  const grants: ReviewerGrant[] = [{
    userId: "curator-1",
    role: "scientificCurator",
    region: null,
    taxonomicGroup: null,
    active: true,
  }];
  assert.equal(canReviewChange(grants, change), true);
  assert.equal(canReviewChange(grants, { ...change, authorId: "curator-1" }), false);
});

test("critical approval requires an independent scientific curator", () => {
  const critical = {
    ...change,
    criticality: "critical" as const,
    mycologistReviewerId: "mycologist-1",
  };
  assert.equal(canApproveCriticalChange({
    id: "curator-1",
    role: "scientificCurator",
  }, critical), true);
  assert.equal(canApproveCriticalChange({
    id: "mycologist-1",
    role: "scientificCurator",
  }, critical), false);
  assert.equal(canApproveCriticalChange({
    id: "collector-1",
    role: "scientificCurator",
  }, critical), false);
});

test("bootstrap curator list is exact and case-insensitive", () => {
  assert.equal(resolveBootstrapRole(
    "Micologo@Example.it",
    "owner@example.it, micologo@example.it",
  ), "scientificCurator");
  assert.equal(resolveBootstrapRole(
    "other@example.it",
    "owner@example.it, micologo@example.it",
  ), null);
});

test("editorial scope allows direct ordinary editing without bypassing assignment", () => {
  const grant: ReviewerGrant = {
    userId: "m1",
    role: "mycologist",
    region: "Emilia-Romagna",
    taxonomicGroup: "Russulaceae",
    active: true,
  };
  assert.equal(hasEditorialScope([grant], "Emilia-Romagna", "Russulaceae"), true);
  assert.equal(hasEditorialScope([grant], "Toscana", "Russulaceae"), false);
  assert.equal(hasEditorialScope([grant], "Emilia-Romagna", "Boletaceae"), false);
});
