import assert from "node:assert/strict";
import test from "node:test";

import { minimumCards } from "./minimum-cards.ts";
import { mediaQueriesForMinimumCard } from "./minimum-card-media.ts";

test("every minimum card has at least one media query plan", () => {
  for (const card of minimumCards) {
    const queries = mediaQueriesForMinimumCard(card);
    assert.ok(queries.length > 0, card.cardId);
    assert.equal(new Set(queries.map((query) => query.term)).size, queries.length);
  }
});

test("species use exact taxon media and multi-taxon teaching sets expose members", () => {
  const phalloides = minimumCards.find((card) => card.sourceLabel === "Amanita phalloides");
  assert.ok(phalloides);
  assert.deepEqual(mediaQueriesForMinimumCard(phalloides), [{
    term: "Amanita phalloides",
    scope: "exactTaxon",
    label: "Immagine del taxon",
  }]);

  const verna = minimumCards.find(
    (card) => card.sourceLabel === "Amanita verna (inclusa A. vidua)",
  );
  assert.ok(verna);
  const queries = mediaQueriesForMinimumCard(verna);
  assert.equal(queries.length, 2);
  assert.equal(queries.every((query) => query.scope === "definedSetMember"), true);
  assert.deepEqual(queries.map((query) => query.term), ["Amanita verna", "Amanita vidua"]);
});

test("source concepts without a current formal taxon are explicitly representative", () => {
  const section = minimumCards.find(
    (card) => card.sourceLabel === "Agaricus sez. Xanthodermatei",
  );
  assert.ok(section);
  const queries = mediaQueriesForMinimumCard(section);
  assert.equal(queries.length, 1);
  assert.equal(queries[0].scope, "representativeGenus");
  assert.equal(queries[0].term, "Agaricus");
  assert.match(queries[0].label, /non identifica il gruppo a specie/);
});
