import assert from "node:assert/strict";
import test from "node:test";

import { minimumCards } from "./minimum-cards.ts";
import { minimumGenusCards } from "./minimum-genus-cards.ts";
import {
  currentGenusIndex,
  genusNameIndex,
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


test("unified genus-name index is unique case-insensitively", () => {
  const keys = genusNameIndex.map((entry) => entry.name.toLocaleLowerCase("it"));
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(genusNameIndex.every((entry) => entry.kinds.length > 0), true);
});

test("every source genus from the 66 teaching cards is searchable through the unified index", () => {
  const indexByName = new Map(
    genusNameIndex.map((entry) => [entry.name.toLocaleLowerCase("it"), entry]),
  );

  for (const card of minimumGenusCards) {
    for (const genus of card.sourceGenera) {
      const entry = indexByName.get(genus.toLocaleLowerCase("it"));
      assert.ok(entry, `missing source genus ${genus}`);
      assert.ok(entry.kinds.includes("sourceGenus"), genus);
      assert.ok(entry.teachingCardIds.includes(card.cardId), `${genus}: ${card.cardId}`);
    }
  }
});

test("all 73 verified current genera are searchable and retain their minimum-card links", () => {
  const indexByName = new Map(
    genusNameIndex.map((entry) => [entry.name.toLocaleLowerCase("it"), entry]),
  );

  assert.equal(currentGenusIndex.length, 73);
  for (const current of currentGenusIndex) {
    const entry = indexByName.get(current.genus.toLocaleLowerCase("it"));
    assert.ok(entry, `missing current genus ${current.genus}`);
    assert.ok(entry.kinds.includes("currentGenus"), current.genus);
    assert.deepEqual(
      new Set(entry.minimumCardIds),
      new Set(current.minimumCardIds),
      current.genus,
    );
  }
});

test("historical and current genus identities can coexist without collapsing their roles", () => {
  const byName = new Map(
    genusNameIndex.map((entry) => [entry.name.toLocaleLowerCase("it"), entry]),
  );

  for (const genus of ["Amanita", "Clitocybe", "Cortinarius", "Lactarius", "Pleurotus"]) {
    const entry = byName.get(genus.toLocaleLowerCase("it"));
    assert.ok(entry, genus);
    assert.ok(entry.kinds.includes("sourceGenus"), `${genus}: missing source role`);
    assert.ok(entry.kinds.includes("currentGenus"), `${genus}: missing current role`);
  }

  for (const transferred of ["Saproamanita", "Phlegmacium", "Infundibulicybe", "Lactifluus"]) {
    const entry = byName.get(transferred.toLocaleLowerCase("it"));
    assert.ok(entry, transferred);
    assert.ok(entry.kinds.includes("currentGenus"), transferred);
  }
});

test("all 148 minimum cards remain reachable after merging source and current genus indexes", () => {
  const reachable = new Set(
    genusNameIndex.flatMap((entry) => entry.minimumCardIds),
  );

  for (const entry of minimumCardNavigation) {
    if (entry.currentGenera.length > 0 || entry.teachingCardId !== null) {
      assert.ok(
        reachable.has(entry.cardId),
        `unreachable card through genus index: ${entry.sourceLabel}`,
      );
    }
  }

  const structuralOnly = minimumCardNavigation.filter(
    (entry) =>
      entry.currentGenera.length === 0 &&
      entry.teachingCardId === null,
  );
  for (const entry of structuralOnly) {
    assert.ok(sourceHeadingIds.has(entry.sourceHeadingId), entry.sourceLabel);
  }
});
