import assert from "node:assert/strict";
import test from "node:test";

import objectives from "../data/taxonomic-objectives.json" with { type: "json" };
import { catalogTaxa } from "./objective-catalog.ts";

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

test("objective records are exposed by the editable application catalog", () => {
  assert.equal(catalogTaxa.length >= objectives.length, true);
  const agaricus = catalogTaxa.find((entry) => entry.id === "objective-agaricus");
  assert.equal(agaricus?.edibility, "mixed");
  assert.match(agaricus?.objectiveSummary?.minimum ?? "", /Xanthodermatei/);
  assert.equal(agaricus?.sources?.some((source) => source.page === 28), true);
});
