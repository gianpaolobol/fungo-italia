import assert from "node:assert/strict";
import test from "node:test";

import type { AtlasTaxon } from "./domain.ts";
import { applyAtlasRevisions, type AtlasRevision } from "./atlas-revisions.ts";

const baseTaxon: AtlasTaxon = {
  id: "amanita-test",
  commonName: "Nome comune",
  scientificName: "Amanita testii",
  acceptedName: "Amanita testii",
  sourceName: "Amanita testii",
  authorship: null,
  rank: "species",
  aliases: [],
  regionalNames: [],
  edibility: "non-valutato",
  safetyNote: "Da valutare",
  recognitionLevel: "minimo",
  objectiveLevels: ["minimo"],
  kingdom: "Fungi",
  division: "Basidiomycota",
  className: "Agaricomycetes",
  order: "Agaricales",
  family: "Amanitaceae",
  parentScientificName: "Amanita",
  diagnosticCharacters: [],
  odor: null,
  ecology: [],
  mediaStatus: "preparing",
  media: [],
  sources: [{ title: "Fonte", page: 1, kind: "obiettivi-minimi" }],
  externalIds: { speciesFungorum: null, indexFungorum: null, mycoBank: null },
};

function revision(fieldPath: string, value: unknown, publishedAt: string): AtlasRevision {
  return {
    id: `${fieldPath}-${publishedAt}`,
    targetTaxonId: baseTaxon.id,
    fieldPath,
    value,
    sourceCitation: "Fonte verificabile",
    rationale: "Aggiornamento scientifico documentato",
    publishedAt,
  };
}

test("rename keeps stable id and previous name searchable", () => {
  const [updated] = applyAtlasRevisions([baseTaxon], [
    revision("taxonomy.acceptedScientificName", "Saproamanita testii", "2026-01-01"),
  ]);
  assert.equal(updated.id, baseTaxon.id);
  assert.equal(updated.acceptedName, "Saproamanita testii");
  assert.equal(updated.scientificName, "Saproamanita testii");
  assert.ok(updated.aliases.includes("Amanita testii"));
});

test("later revisions update diagnostic fields and media without erasing history", () => {
  const media = {
    id: "media-1",
    imageUrl: "https://upload.wikimedia.org/example.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:example.jpg",
    author: "Autore",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    caption: "Cappello",
    verified: true,
    hidden: false,
  };
  const [updated] = applyAtlasRevisions([baseTaxon], [
    revision("diagnostics.odor", "rafanoide", "2026-01-01"),
    revision("media.add", media, "2026-01-02"),
    revision("media.hide", "media-1", "2026-01-03"),
  ]);
  assert.equal(updated.odor, "rafanoide");
  assert.equal(updated.media?.[0].hidden, true);
  assert.equal(updated.mediaStatus, "preparing");
});
