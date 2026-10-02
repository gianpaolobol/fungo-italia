import assert from "node:assert/strict";
import test from "node:test";

import objectives from "../data/taxonomic-objectives.json" with { type: "json" };
import {
  MINIMUM_GENUS_SOURCE_TARGET,
  minimumGenusSourceUnits,
} from "./minimum-genus-source.ts";

test("S1 minimum genus/group source inventory is reproducibly 66 records", () => {
  assert.equal(MINIMUM_GENUS_SOURCE_TARGET, 66);
  assert.equal(minimumGenusSourceUnits.length, 66);
  assert.equal(
    minimumGenusSourceUnits.filter((entry) => entry.sourceRank === "genus").length,
    46,
  );
  assert.equal(
    minimumGenusSourceUnits.filter((entry) => entry.sourceRank === "operationalGroup").length,
    20,
  );
});

test("every genus/group source unit preserves S1 page and minimum objective text", () => {
  const objectiveByLabel = new Map(
    objectives.map((entry) => [entry.scientificName, entry]),
  );

  for (const unit of minimumGenusSourceUnits) {
    const source = objectiveByLabel.get(unit.sourceLabel);
    assert.ok(source, unit.sourceLabel);
    assert.ok(source.objectives.minimum, unit.sourceLabel);
    assert.equal(unit.minimumObjective, source.objectives.minimum);
    assert.equal(unit.sourcePage, source.sources.minimumObjectives.page);
    assert.ok(unit.sourcePage > 0, unit.sourceLabel);
  }
});

test("family and section objectives do not leak into genus/group pages", () => {
  for (const unit of minimumGenusSourceUnits) {
    assert.notEqual(unit.sourceRank, "family");
    assert.notEqual(unit.sourceRank, "section");
  }

  for (const label of [
    "Hydnaceae s.l.",
    "Polyporaceae s.l.",
    "Clathraceae e Phallaceae",
    "Geastraceae + Astraeus",
    "Lycoperdaceae",
    "Pezizaceae s.l. (funghi epigei a coppa o disco)",
    "Boletus ex sez. Luridi (inclusi Cupreoboletus, Exsudoporus, Imperator, Neoboletus, Rubroboletus, Suillellus)",
  ]) {
    assert.equal(
      minimumGenusSourceUnits.some((entry) => entry.sourceLabel === label),
      false,
      label,
    );
  }
});

test("combined and sensu-lato genus objectives remain intact as teaching units", () => {
  for (const label of [
    "Agrocybe + Cyclocybe",
    "Armillaria + Desarmillaria",
    "Clitocybe s.l. (inclusi Ampulloclitocybe, Atractosporocybe, Bonomyces, Clitopaxillus, Harmajaea, Hygrophorocybe, Infundibulicybe, Leucocybe p.p., Musumecia, Paralepistopsis, Pseudoclitocybe, Rhizocybe, Singerocybe, Spodocybe)",
    "Coprinus s.l. (inclusi Coprinellus, Coprinopsis, Narcissea, Parasola, Ephemerocybe)",
    "Inocybe s.l. (inclusi Mallocybe, Inosperma, Pseudosperma)",
    "Xerocomus s.l. (inclusi Alessioporus, Hortiboletus, Pseudoboletus, Pulchroboletus, Rheubarbariboletus, Xerocomellus)",
  ]) {
    assert.ok(
      minimumGenusSourceUnits.some((entry) => entry.sourceLabel === label),
      label,
    );
  }
});
