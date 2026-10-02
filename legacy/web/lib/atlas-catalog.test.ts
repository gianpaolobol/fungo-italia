import assert from "node:assert/strict";
import test from "node:test";

import {
  atlasTaxa,
  objectiveRecords,
  sortAtlasTaxa,
} from "./atlas-catalog.ts";
import { catalogTaxa } from "./objective-catalog.ts";

test("objective headings are separated from atlas cards", () => {
  assert.equal(objectiveRecords.length, 124);
  assert.equal(atlasTaxa.some((taxon) => taxon.id.startsWith("objective-")), false);
  assert.equal(catalogTaxa.some((taxon) => taxon.id.startsWith("objective-")), false);
  assert.equal(
    objectiveRecords.some((entry) => entry.scientificName === "Agaricus"),
    true,
  );
  assert.equal(
    objectiveRecords.some((entry) => entry.scientificName === "Verpa"),
    true,
  );
});

test("explicit species from every learning level become atlas records", () => {
  for (const scientificName of [
    "Amanita phalloides",
    "Amanita crocea",
    "Amanita gioiosa",
    "Russula vesca",
    "Verpa conica",
  ]) {
    assert.ok(
      atlasTaxa.some((taxon) => taxon.scientificName === scientificName),
      `missing ${scientificName}`,
    );
  }
});

test("atlas entries retain rank, order, source page and conservative edibility", () => {
  const deadlyAmanita = atlasTaxa.find(
    (taxon) => taxon.scientificName === "Amanita phalloides",
  );
  const caesarea = atlasTaxa.find(
    (taxon) => taxon.scientificName === "Amanita caesarea",
  );
  const rubescens = atlasTaxa.find(
    (taxon) => taxon.scientificName === "Amanita rubescens",
  );

  assert.equal(deadlyAmanita?.rank, "species");
  assert.equal(deadlyAmanita?.order, "Agaricales");
  assert.equal(deadlyAmanita?.edibility, "tossico");
  assert.equal(deadlyAmanita?.sources[0].page, 4);
  assert.equal(caesarea?.edibility, "commestibile");
  assert.equal(rubescens?.edibility, "commestibile-dopo-trattamento");
});

test("systematic sorting starts with Agaricales and excludes prose fragments", () => {
  const sorted = sortAtlasTaxa(atlasTaxa);
  assert.equal(sorted[0]?.order, "Agaricales");
  assert.equal(
    atlasTaxa.some((taxon) => /^(Determinazione|Per|Altre|Non)\b/.test(taxon.scientificName)),
    false,
  );
  assert.equal(
    new Set(atlasTaxa.map((taxon) => taxon.scientificName)).size,
    atlasTaxa.length,
  );
});
