import assert from "node:assert/strict";
import test from "node:test";

import { catalogSearchDocuments } from "./catalog-search.ts";
import { findGenusCardViewModel } from "./atlas-genus-view.ts";
import {
  type AtlasNavigationState,
  defaultAtlasNavigationState,
  parseAtlasNavigationState,
  returnToAtlasParent,
  selectAtlasCard,
  serializeAtlasNavigationState,
} from "./atlas-navigation-state.ts";
import {
  childCardsForTeachingGroup,
  selectMinimumChildFromTeachingGroup,
} from "./atlas-child-navigation.ts";
import { minimumCards } from "./minimum-cards.ts";

const minimumCardIds = new Set(minimumCards.map((card) => card.cardId));

test("all 214 structured search documents open to a real atlas detail target", () => {
  assert.equal(catalogSearchDocuments.length, 214);

  for (const item of catalogSearchDocuments) {
    if (item.kind === "teachingGroup") {
      const view = findGenusCardViewModel(item.id, "essential");
      assert.ok(view, item.id);
      assert.equal(view.cardId, item.id);
    } else {
      assert.ok(minimumCardIds.has(item.id), item.id);
    }
  }
});

test("all teaching-group child buttons resolve to persisted minimum cards", () => {
  const groups = catalogSearchDocuments.filter(
    (item) => item.kind === "teachingGroup",
  );

  for (const group of groups) {
    const children = childCardsForTeachingGroup(group.id);
    for (const child of children) {
      assert.ok(minimumCardIds.has(child.cardId), group.id + ": " + child.cardId);
    }
  }
});

test("search result -> group -> child -> group -> results preserves filters through URL", () => {
  const amanita = catalogSearchDocuments.find(
    (item) => item.kind === "teachingGroup" && item.title === "Amanita",
  );
  assert.ok(amanita);

  let state: AtlasNavigationState = {
    ...defaultAtlasNavigationState,
    query: "amanita",
    kind: "teachingGroup" as const,
    genus: "Amanita",
    reviewStatus: "reviewNeeded" as const,
  };

  state = selectAtlasCard(state, {
    kind: amanita.kind,
    id: amanita.id,
    depth: "deepening",
  });

  const children = childCardsForTeachingGroup(amanita.id);
  assert.ok(children.length > 0);

  const childResult = selectMinimumChildFromTeachingGroup(
    state,
    amanita.id,
    children[0].cardId,
  );
  assert.equal(childResult.ok, true, childResult.error ?? "");
  state = childResult.state;

  const roundTripChild = parseAtlasNavigationState(
    serializeAtlasNavigationState(state),
  );
  assert.deepEqual(roundTripChild, state);

  state = returnToAtlasParent(roundTripChild);
  assert.equal(state.selectedKind, "teachingGroup");
  assert.equal(state.selectedId, amanita.id);
  assert.equal(state.depth, "deepening");
  assert.equal(state.query, "amanita");
  assert.equal(state.genus, "Amanita");
  assert.equal(state.reviewStatus, "reviewNeeded");

  state = returnToAtlasParent(state);
  assert.equal(state.selectedKind, null);
  assert.equal(state.selectedId, null);
  assert.equal(state.query, "amanita");
  assert.equal(state.genus, "Amanita");
  assert.equal(state.reviewStatus, "reviewNeeded");
});

test("direct minimum search result opens without requiring a parent group", () => {
  const result = catalogSearchDocuments.find(
    (item) =>
      item.kind === "minimumTaxon" &&
      item.sourceLabel === "Amanita phalloides",
  );
  assert.ok(result);

  const opened = selectAtlasCard(
    {
      ...defaultAtlasNavigationState,
      query: "phalloides",
      kind: "minimumTaxon",
    },
    {
      kind: "minimumTaxon",
      id: result.id,
    },
  );

  assert.equal(opened.selectedKind, "minimumTaxon");
  assert.equal(opened.selectedId, result.id);
  assert.equal(opened.returnId, null);

  const closed = returnToAtlasParent(opened);
  assert.equal(closed.selectedId, null);
  assert.equal(closed.query, "phalloides");
  assert.equal(closed.kind, "minimumTaxon");
});
