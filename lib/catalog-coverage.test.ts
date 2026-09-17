import assert from "node:assert/strict";
import test from "node:test";

import objectives from "../data/taxonomic-objectives.json" with { type: "json" };
import { catalogTaxa, objectiveRecords } from "./objective-catalog.ts";

test("the national catalog contains the complete minimum-objective headings", () => {
  assert.equal(objectives.length >= 100, true);
  assert.equal(objectives.some((entry) => entry.scientificName === "Agaricus"), true);
  assert.equal(objectives.some((entry) => entry.scientificName === "Russula"), true);
  assert.equal(objectives.some((entry) => entry.scientificName === "Morchella"), true);
  assert.equal(objectives.some((entry) => entry.scientificName === "Verpa"), true);
  assert.equal(
    objectives.every(
      (entry) =>
        entry.objectives.minimum ||
        entry.objectives.desirable ||
        entry.objectives.advanced,
    ),
    true,
  );
  assert.equal(
    objectives.every((entry) => entry.sources.minimumObjectives.page > 0),
    true,
  );
  assert.equal(
    objectives.every((entry) => (entry.sources.edibilityGuide.page ?? 0) > 0),
    true,
  );
});

test("objective records are exposed separately from the editable atlas", () => {
  assert.equal(catalogTaxa.length > objectives.length, true);
  assert.equal(catalogTaxa.some((entry) => entry.id === "objective-agaricus"), false);
  const agaricus = objectiveRecords.find((entry) => entry.id === "objective-agaricus");
  assert.match(agaricus?.objectives.minimum ?? "", /Xanthodermatei/);
  assert.equal(agaricus?.sources.edibilityGuide.page, 28);
});
