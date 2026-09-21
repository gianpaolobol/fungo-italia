import assert from "node:assert/strict";
import test from "node:test";

import { minimumCards } from "./minimum-cards.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import {
  currentGenusIndex,
  minimumCardNavigation,
  sourceHeadingIndex,
} from "./minimum-navigation.ts";

const minimumCardIds = new Set(minimumCards.map((card) => card.cardId));
const teachingCardIds = new Set(minimumGenusCards.map((card) => card.cardId));
const currentGenera = new Set(currentGenusIndex.map((entry) => entry.genus));
const sourceHeadingIds = new Set(sourceHeadingIndex.map((entry) => entry.sourceHeadingId));

function bySourceLabel(label: string) {
  const found = minimumCardNavigation.find((entry) => entry.sourceLabel === label);
  assert.ok(found, label);
  return found;
}

test("all 148 minimum cards have exactly one navigation entry", () => {
  assert.equal(minimumCardNavigation.length, 148);
  assert.equal(
    new Set(minimumCardNavigation.map((entry) => entry.cardId)).size,
    148,
  );
  assert.deepEqual(
    new Set(minimumCardNavigation.map((entry) => entry.cardId)),
    minimumCardIds,
  );
});

test("every minimum card has a resolvable primary route and no orphan", () => {
  for (const entry of minimumCardNavigation) {
    if (entry.primaryRoute.kind === "teachingCard") {
      assert.ok(teachingCardIds.has(entry.primaryRoute.target), entry.sourceLabel);
    } else if (entry.primaryRoute.kind === "currentGenus") {
      assert.ok(currentGenera.has(entry.primaryRoute.target), entry.sourceLabel);
    } else {
      assert.ok(sourceHeadingIds.has(entry.primaryRoute.target), entry.sourceLabel);
    }
  }
});

test("the verified current-genus index contains 73 unique genera with real minimum cards", () => {
  assert.equal(currentGenusIndex.length, 73);
  assert.equal(new Set(currentGenusIndex.map((entry) => entry.genus)).size, 73);

  for (const entry of currentGenusIndex) {
    assert.ok(entry.minimumCardIds.length > 0, entry.genus);
    for (const cardId of entry.minimumCardIds) {
      assert.ok(minimumCardIds.has(cardId), `${entry.genus}: ${cardId}`);
    }
  }
});

test("129 specific targets route through the 66 genus/group teaching cards", () => {
  const withTeachingCard = minimumCardNavigation.filter(
    (entry) => entry.teachingCardId !== null,
  );
  assert.equal(withTeachingCard.length, 129);
  assert.equal(
    withTeachingCard.every(
      (entry) =>
        entry.primaryRoute.kind === "teachingCard" &&
        entry.primaryRoute.target === entry.teachingCardId,
    ),
    true,
  );
});

test("the 19 family/section targets remain outside the 66 genus/group layer without becoming orphans", () => {
  const withoutTeachingCard = minimumCardNavigation.filter(
    (entry) => entry.teachingCardId === null,
  );
  assert.equal(withoutTeachingCard.length, 19);
  assert.equal(
    withoutTeachingCard.every(
      (entry) => entry.sourceHeadingRank === "family" || entry.sourceHeadingRank === "section",
    ),
    true,
  );
  assert.equal(
    withoutTeachingCard.every((entry) => entry.primaryRoute.kind !== "teachingCard"),
    true,
  );
});

test("family and section examples use current genus when unambiguous and source heading otherwise", () => {
  const satanas = bySourceLabel("Boletus (Rubroboletus) satanas");
  assert.deepEqual(satanas.currentGenera, ["Rubroboletus"]);
  assert.deepEqual(satanas.primaryRoute, {
    kind: "currentGenus",
    target: "Rubroboletus",
  });

  const hericium = bySourceLabel("Hericium spp.");
  assert.deepEqual(hericium.currentGenera, []);
  assert.equal(hericium.sourceHeadingLabel, "Hydnaceae s.l.");
  assert.deepEqual(hericium.primaryRoute, {
    kind: "sourceHeading",
    target: hericium.sourceHeadingId,
  });
});

test("teaching priority is preserved even when a current genus differs from the historical label", () => {
  const phyllophila = bySourceLabel("Clitocybe cerussata (= C. phyllophila)");
  assert.deepEqual(phyllophila.currentGenera, ["Collybia"]);
  assert.ok(phyllophila.teachingCardId);
  assert.deepEqual(phyllophila.primaryRoute, {
    kind: "teachingCard",
    target: phyllophila.teachingCardId,
  });
});
