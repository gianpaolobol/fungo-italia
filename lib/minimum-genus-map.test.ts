import assert from "node:assert/strict";
import test from "node:test";

import {
  currentGenusIndexFromTeachingMaps,
  minimumGenusTeachingMaps,
  sourceGeneraForTeachingLabel,
} from "./minimum-genus-map.ts";

function byLabel(label: string) {
  const found = minimumGenusTeachingMaps.find((entry) => entry.sourceLabel === label);
  assert.ok(found, `missing teaching map for ${label}`);
  return found;
}

test("all 66 S1 minimum genus/group units receive a teaching map", () => {
  assert.equal(minimumGenusTeachingMaps.length, 66);
  assert.equal(new Set(minimumGenusTeachingMaps.map((entry) => entry.teachingUnitId)).size, 66);
  assert.equal(minimumGenusTeachingMaps.every((entry) => entry.sourceGenera.length > 0), true);
});

test("combined source headings preserve their teaching genera without flattening", () => {
  assert.deepEqual(
    sourceGeneraForTeachingLabel("Agrocybe + Cyclocybe"),
    ["Agrocybe", "Cyclocybe"],
  );
  assert.deepEqual(
    sourceGeneraForTeachingLabel("Armillaria + Desarmillaria"),
    ["Armillaria", "Desarmillaria"],
  );
  assert.deepEqual(
    sourceGeneraForTeachingLabel("Hygrophorus + Cuphophyllus"),
    ["Hygrophorus", "Cuphophyllus"],
  );
  assert.deepEqual(
    sourceGeneraForTeachingLabel("Volvariella + Volvopluteus"),
    ["Volvariella", "Volvopluteus"],
  );
});

test("complex operational groups keep deliberate source-genus aliases", () => {
  assert.deepEqual(
    byLabel("Collybioidi e Marasmioidi (Collybia s.l. inclusi Dendrocollybia, Gymnopus, Rhodocollybia, più Strobilurus e Marasmius).").sourceGenera,
    ["Collybia", "Marasmius"],
  );
  assert.deepEqual(
    byLabel("Lepiotoidi: Lepiota (inclusi Chamaemyces, Cystolepiota, Pulverolepiota), Echinoderma, Leucoagaricus, Macrolepiota, Chlorophyllum, Leucocoprinus.").sourceGenera,
    ["Lepiota", "Echinoderma", "Leucoagaricus", "Macrolepiota", "Chlorophyllum", "Leucocoprinus"],
  );
});

test("current child genera are derived from verified taxon mappings", () => {
  assert.deepEqual(
    byLabel("Agrocybe + Cyclocybe").currentChildGenera,
    ["Cyclocybe"],
  );

  const clitocybe = byLabel(
    "Clitocybe s.l. (inclusi Ampulloclitocybe, Atractosporocybe, Bonomyces, Clitopaxillus, Harmajaea, Hygrophorocybe, Infundibulicybe, Leucocybe p.p., Musumecia, Paralepistopsis, Pseudoclitocybe, Rhizocybe, Singerocybe, Spodocybe)",
  );
  for (const genus of ["Clitocybe", "Collybia", "Infundibulicybe", "Paralepistopsis"]) {
    assert.ok(clitocybe.currentChildGenera.includes(genus), genus);
  }

  const cortinarius = byLabel("Cortinarius");
  assert.ok(cortinarius.currentChildGenera.includes("Cortinarius"));
  assert.ok(cortinarius.currentChildGenera.includes("Phlegmacium"));

  const lactarius = byLabel("Lactarius (incluso Lactifluus)");
  assert.ok(lactarius.currentChildGenera.includes("Lactarius"));
  assert.ok(lactarius.currentChildGenera.includes("Lactifluus"));
});

test("genus-only minimum objectives remain source-only until genus nomenclature is verified", () => {
  for (const label of [
    "Hebeloma",
    "Inocybe s.l. (inclusi Mallocybe, Inosperma, Pseudosperma)",
    "Laccaria",
    "Melanoleuca",
    "Paxillus",
  ]) {
    const entry = byLabel(label);
    assert.equal(entry.status, "sourceOnly", label);
    assert.equal(entry.currentChildGenera.length, 0, label);
  }
});

test("current genus index derived from child taxa is deterministic and not forced to legacy 67", () => {
  const genera = currentGenusIndexFromTeachingMaps();
  assert.deepEqual(genera, [...genera].sort((a, b) => a.localeCompare(b, "it")));
  assert.equal(new Set(genera).size, genera.length);
  assert.ok(genera.length > 0);
  assert.notEqual(genera.length, 67);
});
