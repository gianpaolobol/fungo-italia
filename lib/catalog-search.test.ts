import assert from "node:assert/strict";
import test from "node:test";

import {
  catalogSearchDocuments,
  parseCatalogSearchParams,
  searchCatalog,
} from "./catalog-search.ts";

test("search corpus contains 66 teaching cards plus 148 minimum cards", () => {
  assert.equal(catalogSearchDocuments.length, 214);
  assert.equal(
    catalogSearchDocuments.filter((entry) => entry.kind === "teachingGroup").length,
    66,
  );
  assert.equal(
    catalogSearchDocuments.filter((entry) => entry.kind === "minimumTaxon").length,
    148,
  );
});

test("current and historical scientific names both find the same minimum card", () => {
  const historical = searchCatalog({ query: "Amanita vittadinii", limit: 100 });
  const current = searchCatalog({ query: "Saproamanita vittadinii", limit: 100 });

  const historicalIds = new Set(historical.items.map((entry) => entry.id));
  const currentIds = new Set(current.items.map((entry) => entry.id));
  const overlap = [...historicalIds].filter((id) => currentIds.has(id));

  assert.ok(overlap.length > 0);
  assert.ok(
    overlap.some((id) => id.includes("amanita-vittadinii")),
  );
});

test("abbreviated scientific queries remain useful", () => {
  const result = searchCatalog({ query: "A phalloides", limit: 100 });
  assert.ok(
    result.items.some((entry) =>
      entry.sourceLabel.toLocaleLowerCase("it").includes("amanita phalloides")
    ),
  );
});

test("teaching-group text is searchable independently of child cards", () => {
  const result = searchCatalog({
    query: "Collybioidi Marasmioidi",
    filters: { kind: "teachingGroup" },
    limit: 100,
  });
  assert.ok(
    result.items.some((entry) =>
      entry.sourceLabel.includes("Collybioidi e Marasmioidi")
    ),
  );
});

test("current genus filtering reaches transferred taxa", () => {
  const result = searchCatalog({
    filters: {
      kind: "minimumTaxon",
      genus: "Rubroboletus",
    },
    limit: 100,
  });

  assert.ok(result.total > 0);
  assert.ok(
    result.items.some((entry) =>
      entry.currentNames.some((name) => name.startsWith("Rubroboletus "))
    ),
  );
});

test("source genus aliases remain searchable through genus filtering", () => {
  const result = searchCatalog({
    filters: {
      kind: "minimumTaxon",
      genus: "Amanita",
    },
    limit: 100,
  });

  assert.ok(
    result.items.some((entry) => entry.sourceLabel === "Amanita vittadinii"),
  );
});

test("unapproved edibility is excluded from the public search index", () => {
  const reviewNeeded = searchCatalog({
    filters: {
      kind: "minimumTaxon",
      reviewStatus: "reviewNeeded",
    },
    limit: 100,
  });
  assert.ok(reviewNeeded.total > 0);
  assert.equal(
    reviewNeeded.items.every((entry) => entry.edibilityCategory === null),
    true,
  );

  const poisonous = searchCatalog({
    filters: {
      kind: "minimumTaxon",
      edibilityCategory: "POISONOUS",
    },
    limit: 100,
  });
  assert.equal(poisonous.total, 0);
});

test("rank filtering distinguishes teaching groups from species cards", () => {
  const sections = searchCatalog({
    filters: { kind: "minimumTaxon", rank: "section" },
    limit: 100,
  });
  assert.ok(sections.total > 0);
  assert.equal(sections.items.every((entry) => entry.rank === "section"), true);

  const operational = searchCatalog({
    filters: { kind: "teachingGroup", rank: "operationalGroup" },
    limit: 100,
  });
  assert.equal(operational.items.every((entry) => entry.rank === "operationalGroup"), true);
});

test("pagination is bounded and deterministic", () => {
  const first = searchCatalog({ limit: 5, offset: 0 });
  const second = searchCatalog({ limit: 5, offset: 5 });

  assert.equal(first.items.length, 5);
  assert.equal(second.items.length, 5);
  assert.equal(new Set([
    ...first.items.map((entry) => entry.id),
    ...second.items.map((entry) => entry.id),
  ]).size, 10);

  const bounded = searchCatalog({ limit: 5000 });
  assert.equal(bounded.limit, 100);
});

test("URL query parsing is server-compatible and tolerant of bad pagination", () => {
  const request = parseCatalogSearchParams(
    new URLSearchParams(
      "q=amanita&kind=minimumTaxon&rank=species&genus=Amanita&edibility=POISONOUS&reviewStatus=reviewNeeded&limit=20&offset=10",
    ),
  );

  assert.equal(request.query, "amanita");
  assert.equal(request.limit, 20);
  assert.equal(request.offset, 10);
  assert.equal(request.filters?.kind, "minimumTaxon");
  assert.equal(request.filters?.rank, "species");
  assert.equal(request.filters?.genus, "Amanita");
  assert.equal(request.filters?.edibilityCategory, "POISONOUS");
  assert.equal(request.filters?.reviewStatus, "reviewNeeded");

  const bad = parseCatalogSearchParams(new URLSearchParams("limit=nope&offset=nope"));
  assert.equal(bad.limit, 30);
  assert.equal(bad.offset, 0);
});
