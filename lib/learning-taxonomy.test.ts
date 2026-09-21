import assert from "node:assert/strict";
import test from "node:test";

import {
  minimumNomenclatureMappings,
  nomenclatureConflicts,
  unresolvedNomenclatureMappings,
} from "./minimum-nomenclature.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import {
  COMPLETE_MINIMUM_UNIT_TARGET,
  LEGACY_PROVISIONAL_CURRENT_CONCEPT_TARGET,
  type LearningNomenclatureMapping,
  type LearningUnit,
  validateMinimumLearningInventory,
  validateMinimumNomenclatureMappings,
} from "./learning-taxonomy.ts";

function unit(
  id: string,
  overrides: Partial<LearningUnit> = {},
): LearningUnit {
  return {
    id,
    sourceHeadingId: "objective-test",
    sourceLabel: id.replaceAll("-", " "),
    sourcePage: 4,
    level: "minimum",
    requiredResolution: "species",
    deepMorphologyRequired: false,
    reviewStatus: "normalized",
    ...overrides,
  };
}

function mapping(
  sourceUnitId: string,
  overrides: Partial<LearningNomenclatureMapping> = {},
): LearningNomenclatureMapping {
  return {
    sourceUnitId,
    sourceLabel: sourceUnitId.replaceAll("-", " "),
    status: "accepted",
    currentAcceptedNames: ["Amanita phalloides"],
    preferredDisplayName: "Amanita phalloides",
    evidence: [{
      source: "index-fungorum",
      sourceUrl: "https://www.indexfungorum.org/",
      checkedAt: "2026-09-21",
      queryName: "Amanita phalloides",
      expectedCurrentName: "Amanita phalloides",
    }],
    ...overrides,
  };
}

function bySourceLabel(label: string) {
  const found = minimumNomenclatureMappings.find((entry) => entry.sourceLabel === label);
  assert.ok(found, `missing nomenclature mapping for ${label}`);
  return found;
}

test("the only hard source cardinality invariant is 148 learning units", () => {
  assert.equal(COMPLETE_MINIMUM_UNIT_TARGET, 148);
  assert.equal(LEGACY_PROVISIONAL_CURRENT_CONCEPT_TARGET, 141);
});

test("the curated source inventory contains exactly the 148 minimum learning units", () => {
  assert.equal(sourceMinimumLearningUnits.length, COMPLETE_MINIMUM_UNIT_TARGET);

  const result = validateMinimumLearningInventory(sourceMinimumLearningUnits);

  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.unitCount, 148);
});

test("sensu lato, section and subgenus source units cannot be flattened to species", () => {
  const units = [
    unit("amanita-excelsa-sl", {
      sourceLabel: "Amanita excelsa s.l.",
      requiredResolution: "species",
    }),
    unit("agaricus-xanthodermatei", {
      sourceLabel: "Agaricus sez. Xanthodermatei",
      requiredResolution: "species",
    }),
    unit("cortinarius-dermocybe", {
      sourceLabel: "Cortinarius sottogenere Dermocybe",
      requiredResolution: "species",
    }),
  ];

  const result = validateMinimumLearningInventory(units, { expectedUnits: 3 });

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.includes("sensu-lato")), true);
  assert.equal(result.errors.some((error) => error.includes("section unit")), true);
  assert.equal(result.errors.some((error) => error.includes("subgenus unit")), true);
});

test("known prose fragments from the legacy regex parser are rejected", () => {
  const result = validateMinimumLearningInventory(
    [unit("artifact", { sourceLabel: "Ramaria colorate" })],
    { expectedUnits: 1 },
  );

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /parser prose artifact/);
});

test("release-grade source validation can require approved review status", () => {
  const result = validateMinimumLearningInventory(
    [unit("amanita-phalloides")],
    { expectedUnits: 1, requireApproved: true },
  );

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /not approved/);
});

test("every source learning unit has exactly one explicit nomenclature mapping", () => {
  const result = validateMinimumNomenclatureMappings(
    sourceMinimumLearningUnits,
    minimumNomenclatureMappings,
  );

  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.sourceUnitCount, 148);
  assert.equal(result.mappingCount, 148);
  assert.equal(result.unresolvedCount, 0);
  assert.equal(unresolvedNomenclatureMappings.length, 0);
});

test("known S1/current-taxonomy disagreements remain explicit conflicts", () => {
  assert.equal(nomenclatureConflicts.length, 3);

  assert.deepEqual(
    bySourceLabel("Amanita verna (inclusa A. vidua)").currentAcceptedNames,
    ["Amanita verna", "Amanita vidua"],
  );
  assert.deepEqual(
    bySourceLabel("Clitocybe dealbata (= C. rivulosa)").currentAcceptedNames,
    ["Clitocybe dealbata", "Collybia rivulosa"],
  );
  assert.deepEqual(
    bySourceLabel("Pleurotus cornucopiae (incluso P. citrinopileatus)").currentAcceptedNames,
    ["Pleurotus cornucopiae", "Pleurotus citrinopileatus"],
  );

  const publication = validateMinimumNomenclatureMappings(
    sourceMinimumLearningUnits,
    minimumNomenclatureMappings,
    { requirePublishable: true },
  );
  assert.equal(publication.ok, false);
  assert.equal(
    publication.errors.filter((error) => error.includes("blocks publication")).length,
    3,
  );
});

test("verified modern combinations are retained without rewriting the source label", () => {
  assert.deepEqual(
    bySourceLabel("Amanita vittadinii").currentAcceptedNames,
    ["Saproamanita vittadinii"],
  );
  assert.deepEqual(
    bySourceLabel("Clitocybe cerussata (= C. phyllophila)").currentAcceptedNames,
    ["Collybia phyllophila"],
  );
  assert.deepEqual(
    bySourceLabel("Cortinarius variiformis").currentAcceptedNames,
    ["Phlegmacium variiforme"],
  );
  assert.deepEqual(
    bySourceLabel("Leucoagaricus leucothites s.l.").currentAcceptedNames,
    ["Leucocoprinus leucothites"],
  );
  assert.deepEqual(
    bySourceLabel("Lepista nuda s.l.").currentAcceptedNames,
    ["Collybia nuda"],
  );
  assert.deepEqual(
    bySourceLabel("Boletus (Rubroboletus) satanas").currentAcceptedNames,
    ["Rubroboletus satanas"],
  );
  assert.deepEqual(
    bySourceLabel("Polyporus squamosus").currentAcceptedNames,
    ["Cerioporus squamosus"],
  );
});

test("source groups and sections remain source concepts rather than fake accepted species", () => {
  for (const label of [
    "Agaricus sez. Xanthodermatei",
    "Amanita excelsa s.l. (incl. A. spissa, A. franchetii)",
    "Cortinarius sottogenere Dermocybe",
    "Mycena sez. Purae",
    "Tricholoma gruppo Virgati (T. virgatum, T. sciodes, T. bresadolanum)",
    "Hericium spp.",
  ]) {
    assert.equal(bySourceLabel(label).status, "sourceConcept", label);
  }
});

test("mapping validation rejects missing, duplicate and label-drift records", () => {
  const units = [unit("amanita-phalloides")];
  const missing = validateMinimumNomenclatureMappings(units, []);
  assert.match(missing.errors.join("\n"), /missing nomenclature mapping/);

  const good = mapping("amanita-phalloides");
  const duplicate = validateMinimumNomenclatureMappings(units, [good, good]);
  assert.match(duplicate.errors.join("\n"), /duplicate mapping/);

  const drift = validateMinimumNomenclatureMappings(units, [{
    ...good,
    sourceLabel: "Amanita virosa",
  }]);
  assert.match(drift.errors.join("\n"), /source label drift/);
});
