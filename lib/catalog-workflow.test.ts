import assert from "node:assert/strict";
import test from "node:test";

import { nextChangeStatus } from "./catalog-workflow.ts";

test("an ordinary change is approved by an in-scope micologist", () => {
  assert.equal(nextChangeStatus({
    criticality: "ordinary",
    authorId: "collector-1",
    mycologistReviewerId: "mycologist-1",
    mycologistDecision: "approve",
  }), "approved");
});

test("a critical author cannot self-approve", () => {
  assert.equal(nextChangeStatus({
    criticality: "critical",
    authorId: "curator-1",
    mycologistReviewerId: "curator-1",
    mycologistDecision: "approve",
    scientificReviewerId: "curator-1",
    scientificDecision: "approve",
  }), "inReview");
});

test("a critical change needs independent scientific approval", () => {
  assert.equal(nextChangeStatus({
    criticality: "critical",
    authorId: "collector-1",
    mycologistReviewerId: "mycologist-1",
    mycologistDecision: "approve",
    scientificReviewerId: "curator-1",
    scientificDecision: "approve",
  }), "approved");
});

test("request changes and rejection remain explicit states", () => {
  assert.equal(nextChangeStatus({
    criticality: "ordinary",
    authorId: "collector-1",
    mycologistReviewerId: "mycologist-1",
    mycologistDecision: "requestChanges",
  }), "changesRequested");

  assert.equal(nextChangeStatus({
    criticality: "critical",
    authorId: "collector-1",
    mycologistReviewerId: "mycologist-1",
    mycologistDecision: "reject",
  }), "rejected");
});
