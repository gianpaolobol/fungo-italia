import assert from "node:assert/strict";
import test from "node:test";

import { shouldUseCatalogServerSearch } from "./catalog-search-request.ts";

test("legacy catalog request stays in compatibility mode without search params", () => {
  assert.equal(shouldUseCatalogServerSearch(new URLSearchParams()), false);
});

test("recognized search and pagination params activate server search", () => {
  for (const query of [
    "q=amanita",
    "kind=minimumTaxon",
    "rank=species",
    "genus=Amanita",
    "edibility=POISONOUS",
    "reviewStatus=reviewNeeded",
    "limit=20",
    "offset=20",
  ]) {
    assert.equal(
      shouldUseCatalogServerSearch(new URLSearchParams(query)),
      true,
      query,
    );
  }
});

test("unrelated params do not silently change the response shape", () => {
  assert.equal(
    shouldUseCatalogServerSearch(new URLSearchParams("foo=bar&view=atlas")),
    false,
  );
});
