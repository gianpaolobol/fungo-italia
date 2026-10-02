import assert from "node:assert/strict";
import test from "node:test";

import { applyPublishedChanges } from "./catalog-publication.ts";
import type { Taxon } from "./domain.ts";

const base: Taxon[] = [{
  id: "russula-vesca",
  commonName: "Colombina rosa",
  scientificName: "Russula vesca",
  rank: "species",
  aliases: [],
  regionalNames: [],
  edibility: "non-valutato",
  safetyNote: "Dato alimentare non ancora importato dalla fonte S2.",
}];

test("published regional names overlay a cloned base release", () => {
  const result = applyPublishedChanges(base, [{
    changeSetId: "c1",
    status: "published",
    proposalKind: "update",
    targetTaxonId: "russula-vesca",
    fieldPath: "names.regional",
    proposedValueJson: JSON.stringify({ value: "Rossella" }),
    regionScope: "Toscana",
    publishedAt: "2026-09-16T12:00:00.000Z",
  }]);
  assert.deepEqual(result[0].regionalNames, [{ name: "Rossella", regions: ["Toscana"] }]);
  assert.deepEqual(base[0].regionalNames, []);
});

test("later published value wins deterministically", () => {
  const result = applyPublishedChanges(base, [
    {
      changeSetId: "c1",
      status: "published",
      proposalKind: "update",
      targetTaxonId: "russula-vesca",
      fieldPath: "names.common",
      proposedValueJson: JSON.stringify({ value: "Nome vecchio" }),
      regionScope: null,
      publishedAt: "2026-09-16T10:00:00.000Z",
    },
    {
      changeSetId: "c2",
      status: "published",
      proposalKind: "update",
      targetTaxonId: "russula-vesca",
      fieldPath: "names.common",
      proposedValueJson: JSON.stringify({ value: "Nome aggiornato" }),
      regionScope: null,
      publishedAt: "2026-09-16T12:00:00.000Z",
    },
  ]);
  assert.equal(result[0].commonName, "Nome aggiornato");
});

test("published new taxon starts as not assessed instead of inventing edibility", () => {
  const result = applyPublishedChanges(base, [{
    changeSetId: "new-1",
    status: "published",
    proposalKind: "create",
    targetTaxonId: null,
    fieldPath: "taxonomy.create",
    proposedValueJson: JSON.stringify({
      value: "Amanita sect. Vaginatae",
      scientificName: "Amanita sect. Vaginatae",
      rank: "section",
    }),
    regionScope: null,
    publishedAt: "2026-09-16T12:00:00.000Z",
  }]);
  assert.equal(result[1].edibility, "non-valutato");
  assert.equal(result[1].rank, "section");
});

test("non-published changes are excluded", () => {
  const result = applyPublishedChanges(base, [{
    changeSetId: "rejected-1",
    status: "rejected",
    proposalKind: "update",
    targetTaxonId: "russula-vesca",
    fieldPath: "names.common",
    proposedValueJson: JSON.stringify({ value: "Nome respinto" }),
    regionScope: null,
    publishedAt: "2026-09-16T12:00:00.000Z",
  }]);
  assert.equal(result[0].commonName, "Colombina rosa");
});
