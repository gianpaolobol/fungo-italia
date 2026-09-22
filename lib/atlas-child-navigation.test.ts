import assert from "node:assert/strict";
import test from "node:test";

import { defaultAtlasNavigationState } from "./atlas-navigation-state.ts";
import {
  childCardsForTeachingGroup,
  selectMinimumChildFromTeachingGroup,
} from "./atlas-child-navigation.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";

function genusCard(label: string) {
  const found = minimumGenusCards.find((card) => card.sourceLabel === label);
  assert.ok(found, `missing genus card ${label}`);
  return found;
}

test("child navigation preserves search filters and opens the child at essential depth", () => {
  const parent = genusCard("Amanita");
  assert.ok(parent.minimumChildCardIds.length > 0);
  const child = parent.minimumChildCardIds[0];

  const state = {
    ...defaultAtlasNavigationState,
    query: "amanita",
    kind: "teachingGroup" as const,
    genus: "Amanita",
    edibility: "POISONOUS" as const,
    reviewStatus: "reviewNeeded" as const,
    selectedKind: "teachingGroup" as const,
    selectedId: parent.cardId,
    depth: "specialist" as const,
  };

  const result = selectMinimumChildFromTeachingGroup(
    state,
    parent.cardId,
    child,
  );

  assert.equal(result.ok, true, result.error ?? "");
  assert.equal(result.state.query, state.query);
  assert.equal(result.state.kind, state.kind);
  assert.equal(result.state.genus, state.genus);
  assert.equal(result.state.edibility, state.edibility);
  assert.equal(result.state.reviewStatus, state.reviewStatus);
  assert.equal(result.state.selectedKind, "minimumTaxon");
  assert.equal(result.state.selectedId, child);
  assert.equal(result.state.depth, "essential");
  assert.equal(result.state.returnKind, "teachingGroup");
  assert.equal(result.state.returnId, parent.cardId);
  assert.equal(result.state.returnDepth, "specialist");
});

test("a child cannot be opened through an unrelated teaching group", () => {
  const amanita = genusCard("Amanita");
  const tricholoma = genusCard("Tricholoma");
  assert.ok(amanita.minimumChildCardIds.length > 0);
  assert.ok(tricholoma.minimumChildCardIds.length > 0);

  const result = selectMinimumChildFromTeachingGroup(
    defaultAtlasNavigationState,
    amanita.cardId,
    tricholoma.minimumChildCardIds[0],
  );

  assert.equal(result.ok, false);
  assert.equal(result.state, defaultAtlasNavigationState);
  assert.match(result.error ?? "", /is not a child/);
});

test("unknown group and unknown child ids fail without mutating navigation state", () => {
  const state = {
    ...defaultAtlasNavigationState,
    query: "boletus",
  };

  const missingGroup = selectMinimumChildFromTeachingGroup(
    state,
    "missing-group",
    "missing-child",
  );
  assert.equal(missingGroup.ok, false);
  assert.equal(missingGroup.state, state);
  assert.match(missingGroup.error ?? "", /Unknown teaching group/);

  const parent = genusCard("Amanita");
  const missingChild = selectMinimumChildFromTeachingGroup(
    state,
    parent.cardId,
    "missing-child",
  );
  assert.equal(missingChild.ok, false);
  assert.equal(missingChild.state, state);
});

test("child card resolver returns exactly the persisted minimum children", () => {
  const parent = genusCard("Amanita");
  const children = childCardsForTeachingGroup(parent.cardId);

  assert.equal(children.length, parent.minimumChildCardIds.length);
  assert.deepEqual(
    children.map((card) => card.cardId),
    parent.minimumChildCardIds,
  );
});

test("a source-only genus group can validly have no minimum child cards", () => {
  const sourceOnly = minimumGenusCards.find(
    (card) => card.minimumChildCardIds.length === 0,
  );
  assert.ok(sourceOnly);
  assert.deepEqual(childCardsForTeachingGroup(sourceOnly.cardId), []);
});
