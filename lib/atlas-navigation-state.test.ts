import assert from "node:assert/strict";
import test from "node:test";

import {
  atlasStateHref,
  closeAtlasCard,
  defaultAtlasNavigationState,
  parseAtlasNavigationState,
  returnToAtlasParent,
  selectAtlasCard,
  serializeAtlasNavigationState,
  setAtlasDepth,
} from "./atlas-navigation-state.ts";

test("default atlas navigation state serializes to a clean URL", () => {
  assert.equal(serializeAtlasNavigationState(defaultAtlasNavigationState).toString(), "");
  assert.equal(atlasStateHref("/?tab=atlante".split("?")[0], defaultAtlasNavigationState), "/");
});

test("search filters survive opening and closing a card", () => {
  const filtered = {
    ...defaultAtlasNavigationState,
    query: "amanita",
    kind: "minimumTaxon" as const,
    rank: "species",
    genus: "Amanita",
    edibility: "POISONOUS" as const,
    reviewStatus: "reviewNeeded" as const,
  };

  const opened = selectAtlasCard(filtered, {
    kind: "minimumTaxon",
    id: "minimum-card-objective-amanita--01--amanita-phalloides",
  });
  const closed = closeAtlasCard(opened);

  assert.equal(closed.query, filtered.query);
  assert.equal(closed.kind, filtered.kind);
  assert.equal(closed.rank, filtered.rank);
  assert.equal(closed.genus, filtered.genus);
  assert.equal(closed.edibility, filtered.edibility);
  assert.equal(closed.reviewStatus, filtered.reviewStatus);
  assert.equal(closed.selectedId, null);
});

test("selected card and progressive depth round-trip through URL params", () => {
  const state = selectAtlasCard(
    {
      ...defaultAtlasNavigationState,
      query: "Clitocybe",
      kind: "teachingGroup",
      genus: "Infundibulicybe",
    },
    {
      kind: "teachingGroup",
      id: "minimum-genus-card-clitocybe-s-l",
      depth: "specialist",
    },
  );

  const serialized = serializeAtlasNavigationState(state);
  const parsed = parseAtlasNavigationState(serialized);

  assert.deepEqual(parsed, state);
});

test("invalid URL enum values degrade to safe defaults", () => {
  const parsed = parseAtlasNavigationState(
    new URLSearchParams(
      "kind=garbage&edibility=garbage&reviewStatus=garbage&selectedKind=garbage&selectedId=abc&depth=garbage",
    ),
  );

  assert.equal(parsed.kind, "all");
  assert.equal(parsed.edibility, "");
  assert.equal(parsed.reviewStatus, "");
  assert.equal(parsed.selectedKind, null);
  assert.equal(parsed.selectedId, null);
  assert.equal(parsed.depth, "essential");
});

test("depth cannot be elevated without an open card", () => {
  const next = setAtlasDepth(defaultAtlasNavigationState, "specialist");
  assert.equal(next.depth, "essential");
});

test("opening a new card resets depth unless explicitly requested", () => {
  const first = selectAtlasCard(defaultAtlasNavigationState, {
    kind: "teachingGroup",
    id: "one",
    depth: "specialist",
  });
  const second = selectAtlasCard(first, {
    kind: "minimumTaxon",
    id: "two",
  });

  assert.equal(second.selectedKind, "minimumTaxon");
  assert.equal(second.selectedId, "two");
  assert.equal(second.depth, "essential");
});

test("href preserves filters and selection without empty query noise", () => {
  const href = atlasStateHref("/atlas", {
    ...defaultAtlasNavigationState,
    query: "  boletus ",
    genus: "Rubroboletus",
    selectedKind: "minimumTaxon",
    selectedId: "card-1",
    depth: "deepening",
  });

  assert.match(href, /^\/atlas\?/);
  const params = new URL(href, "https://example.test").searchParams;
  assert.equal(params.get("q"), "boletus");
  assert.equal(params.get("genus"), "Rubroboletus");
  assert.equal(params.get("selectedKind"), "minimumTaxon");
  assert.equal(params.get("selectedId"), "card-1");
  assert.equal(params.get("depth"), "deepening");
  assert.equal(params.has("rank"), false);
});


test("parent return context round-trips through URL and restores prior card depth", () => {
  const parent = selectAtlasCard(
    {
      ...defaultAtlasNavigationState,
      query: "amanita",
      genus: "Amanita",
    },
    {
      kind: "teachingGroup",
      id: "group-amanita",
      depth: "specialist",
    },
  );

  const child = selectAtlasCard(parent, {
    kind: "minimumTaxon",
    id: "minimum-amanita-phalloides",
    returnToCurrent: true,
  });

  assert.equal(child.returnKind, "teachingGroup");
  assert.equal(child.returnId, "group-amanita");
  assert.equal(child.returnDepth, "specialist");

  const parsed = parseAtlasNavigationState(
    serializeAtlasNavigationState(child),
  );
  assert.deepEqual(parsed, child);

  const restored = returnToAtlasParent(parsed);
  assert.equal(restored.query, "amanita");
  assert.equal(restored.genus, "Amanita");
  assert.equal(restored.selectedKind, "teachingGroup");
  assert.equal(restored.selectedId, "group-amanita");
  assert.equal(restored.depth, "specialist");
  assert.equal(restored.returnKind, null);
  assert.equal(restored.returnId, null);
  assert.equal(restored.returnDepth, "essential");
});

test("return without parent context closes the card but preserves filters", () => {
  const opened = selectAtlasCard(
    {
      ...defaultAtlasNavigationState,
      query: "boletus",
      genus: "Rubroboletus",
    },
    {
      kind: "minimumTaxon",
      id: "card-1",
    },
  );

  const restored = returnToAtlasParent(opened);
  assert.equal(restored.query, "boletus");
  assert.equal(restored.genus, "Rubroboletus");
  assert.equal(restored.selectedKind, null);
  assert.equal(restored.selectedId, null);
});
