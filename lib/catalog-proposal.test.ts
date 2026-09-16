import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyCriticality,
  validateCatalogProposal,
} from "./catalog-proposal.ts";

test("taxonomy, edibility, and high-risk confusion fields are critical", () => {
  assert.equal(classifyCriticality(["taxonomy.acceptedScientificName"]), "critical");
  assert.equal(classifyCriticality(["edibility.category"]), "critical");
  assert.equal(classifyCriticality(["safety.confusion.high"]), "critical");
  assert.equal(classifyCriticality(["names.regional"]), "ordinary");
  assert.equal(classifyCriticality(["ecology.habitat"]), "ordinary");
});

test("new taxon proposal requires supported rank, name, rationale, and source", () => {
  const result = validateCatalogProposal({
    proposalKind: "create",
    proposedScientificName: "",
    proposedRank: "invented",
    fieldPath: "taxonomy.create",
    proposedValue: "",
    rationale: "breve",
    sourceCitation: "",
  });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.errors.includes("Inserisci il nome scientifico proposto."));
    assert.ok(result.errors.includes("Seleziona un rango tassonomico supportato."));
    assert.ok(result.errors.includes("Descrivi la motivazione con almeno 20 caratteri."));
    assert.ok(result.errors.includes("Indica una fonte verificabile."));
  }
});

test("update proposal requires a target and preserves group-level values", () => {
  const result = validateCatalogProposal({
    proposalKind: "update",
    targetTaxonId: "lactarius-deliciosi",
    fieldPath: "names.regional",
    proposedValue: "Rositi — Basilicata e Calabria",
    rationale: "Aggiunta del nome regionale con ambito territoriale esplicito.",
    sourceCitation: "Raccolta lessicale regionale, scheda 12",
    regionScope: "Basilicata",
    taxonomicScope: "Lactarius sect. Deliciosi",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.targetTaxonId, "lactarius-deliciosi");
    assert.equal(result.data.criticality, "ordinary");
    assert.equal(result.data.proposedValue, "Rositi — Basilicata e Calabria");
  }
});
