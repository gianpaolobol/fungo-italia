import assert from "node:assert/strict";
import test from "node:test";

import {
  allCatalogEvidence,
  catalogSources,
  nomenclatureEvidence,
  sourcePageIndex,
  trainingEvidence,
  guardTaxonSensitiveFields,
  validateCatalogEvidence,
  validateSourcePageIndex,
  type CatalogEvidence,
  type CatalogSource,
} from "./catalog-evidence.ts";
import { minimumNomenclatureMappings } from "./minimum-nomenclature.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";

test("authoritative source registry separates training, edibility and nomenclature authority", () => {
  const roles = new Map(catalogSources.map((source) => [source.sourceId, source.authorityRole]));

  assert.equal(
    roles.get("source-s1-taxonomic-objectives-v4-2026-06-09"),
    "training",
  );
  assert.equal(
    roles.get("source-s2-guida-commestibilita-2021"),
    "edibility",
  );
  assert.equal(
    roles.get("source-nomenclature-index-fungorum"),
    "nomenclature",
  );

  const s2 = catalogSources.find(
    (source) => source.sourceId === "source-s2-guida-commestibilita-2021",
  );
  assert.equal(s2?.publisher, "Regione Piemonte");
  assert.equal(s2?.publicationYear, 2021);
  assert.match(s2?.isbnOrDoi ?? "", /979-12-200-9297-5/);
  assert.match(s2?.url ?? "", /^https:\/\/www\.regione\.piemonte\.it\//);
});

test("all 148 minimum learning units have exactly one direct S1 training evidence record", () => {
  assert.equal(sourceMinimumLearningUnits.length, 148);
  assert.equal(trainingEvidence.length, 148);

  const result = validateCatalogEvidence();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.trainingEvidenceCount >= 148, true);

  const direct = new Map(
    trainingEvidence.map((evidence) => [evidence.subjectId, evidence]),
  );
  for (const unit of sourceMinimumLearningUnits) {
    const evidence = direct.get(unit.id);
    assert.ok(evidence, unit.id);
    assert.equal(evidence.claimType, "training");
    assert.equal(
      evidence.sourceId,
      "source-s1-taxonomic-objectives-v4-2026-06-09",
    );
    assert.match(evidence.sourceLocation, new RegExp(`^p\\. ${unit.sourcePage} `));
  }
});

test("all nomenclature mappings retain machine-checkable evidence provenance", () => {
  assert.equal(minimumNomenclatureMappings.length, 148);

  const bySubject = new Map<string, CatalogEvidence[]>();
  for (const evidence of nomenclatureEvidence) {
    const records = bySubject.get(evidence.subjectId) ?? [];
    records.push(evidence);
    bySubject.set(evidence.subjectId, records);
  }

  for (const mapping of minimumNomenclatureMappings) {
    const evidence = bySubject.get(mapping.sourceUnitId) ?? [];
    assert.equal(
      evidence.length,
      mapping.evidence.length,
      mapping.sourceLabel,
    );
  }
});

test("source page reconciliation covers every objective heading in both S1 and S2", () => {
  const result = validateSourcePageIndex();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.rowCount, 124);
  assert.equal(sourcePageIndex.every((row) => row.s1.page > 0 && row.s2.page > 0), true);
});

test("edibility and treatment claims are rejected when sourced to S1", () => {
  const s1 = catalogSources.find(
    (source) => source.sourceId === "source-s1-taxonomic-objectives-v4-2026-06-09",
  );
  assert.ok(s1);

  const bad: CatalogEvidence = {
    evidenceId: "bad-edibility",
    subjectType: "taxon",
    subjectId: "amanita-phalloides",
    sourceId: s1.sourceId,
    sourceLocation: "p. 4",
    claimType: "edibility",
    claimSummary: "Test claim.",
    evidenceStrength: "primaryExplicit",
    extractedBy: "test",
    extractedAt: "2026-09-21T00:00:00Z",
    reviewedBy: null,
    reviewedAt: null,
    reviewStatus: "approved",
    notes: null,
  };

  const result = validateCatalogEvidence(catalogSources, [bad], { requireCoreCoverage: false });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /edibility claim must use edibility authority/);
});

test("S2 edibility evidence can pass authority validation but public sensitive claims require approval", () => {
  const base: CatalogEvidence = {
    evidenceId: "s2-edibility",
    subjectType: "taxon",
    subjectId: "amanita-caesarea",
    sourceId: "source-s2-guida-commestibilita-2021",
    sourceLocation: "p. 30",
    claimType: "edibility",
    claimSummary: "La fonte S2 valuta il taxon nella categoria alimentare indicata.",
    evidenceStrength: "primaryExplicit",
    extractedBy: "test",
    extractedAt: "2026-09-21T00:00:00Z",
    reviewedBy: null,
    reviewedAt: null,
    reviewStatus: "normalized",
    notes: null,
  };

  assert.equal(
    validateCatalogEvidence(catalogSources, [base], { requireCoreCoverage: false }).ok,
    true,
  );

  const blocked = validateCatalogEvidence(catalogSources, [base], {
    requirePublishable: true,
    requireCoreCoverage: false,
  });
  assert.equal(blocked.ok, false);
  assert.match(blocked.errors.join("\n"), /sensitive claim is not approved/);

  const approved = validateCatalogEvidence(
    catalogSources,
    [{ ...base, reviewStatus: "approved", reviewedBy: "reviewer-1", reviewedAt: "2026-09-21T00:00:00Z" }],
    { requirePublishable: true, requireCoreCoverage: false },
  );
  assert.equal(approved.ok, true, approved.errors.join("\n"));
});

test("remote sources require URL and access date", () => {
  const source: CatalogSource = {
    ...catalogSources[0],
    sourceId: "invalid-remote",
    authorityRole: "supplemental",
    assetStatus: "officialRemote",
    url: null,
    accessedAt: null,
  };
  const result = validateCatalogEvidence([source], [], { requireCoreCoverage: false });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /requires https URL/);
  assert.match(result.errors.join("\n"), /requires accessedAt/);
});

test("combined evidence IDs are unique and claim summaries stay compact", () => {
  const ids = allCatalogEvidence.map((evidence) => evidence.evidenceId);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(allCatalogEvidence.every((evidence) => evidence.claimSummary.length <= 500), true);
});


test("taxon edibility stays hidden until an approved S2 claim exists", () => {
  const taxon = {
    id: "amanita-caesarea",
    commonName: "Ovolo buono",
    scientificName: "Amanita caesarea",
    rank: "species" as const,
    aliases: [],
    regionalNames: [],
    edibility: "commestibile" as const,
    safetyNote: "Legacy note",
  };

  const guarded = guardTaxonSensitiveFields(taxon, []);
  assert.equal(guarded.edibility, "non-valutato");
  assert.match(guarded.safetyNote, /evidenza S2 approvata/);

  const evidence: CatalogEvidence = {
    evidenceId: "approved-s2",
    subjectType: "taxon",
    subjectId: taxon.id,
    sourceId: "source-s2-guida-commestibilita-2021",
    sourceLocation: "p. 30",
    claimType: "edibility",
    claimSummary: "Categoria alimentare verificata nella fonte S2.",
    evidenceStrength: "primaryExplicit",
    extractedBy: "test",
    extractedAt: "2026-09-21T00:00:00Z",
    reviewedBy: "reviewer-1",
    reviewedAt: "2026-09-21T00:00:00Z",
    reviewStatus: "approved",
    notes: null,
  };

  const released = guardTaxonSensitiveFields(taxon, [evidence]);
  assert.equal(released.edibility, "commestibile");
  assert.equal(released.safetyNote, "Legacy note");
});
