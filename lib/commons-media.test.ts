import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCommonsCandidate,
  isCompatibleCommonsLicense,
  taxonMediaMatchScore,
} from "./commons-media.ts";

test("accepts reusable Commons licenses and rejects NC/ND variants", () => {
  assert.equal(isCompatibleCommonsLicense("CC BY-SA 4.0"), true);
  assert.equal(isCompatibleCommonsLicense("CC BY 4.0"), true);
  assert.equal(isCompatibleCommonsLicense("CC0 1.0"), true);
  assert.equal(isCompatibleCommonsLicense("Public domain"), true);
  assert.equal(isCompatibleCommonsLicense("CC BY-NC 4.0"), false);
  assert.equal(isCompatibleCommonsLicense("CC BY-ND 4.0"), false);
  assert.equal(isCompatibleCommonsLicense("All rights reserved"), false);
});

test("taxon matching requires genus and epithet evidence for species queries", () => {
  assert.equal(
    taxonMediaMatchScore("Amanita phalloides", ["Amanita phalloides 2019.jpg"]),
    3,
  );
  assert.equal(
    taxonMediaMatchScore("Amanita phalloides", ["Amanita - unidentified mushroom"]),
    1,
  );
  assert.equal(
    taxonMediaMatchScore("Amanita phalloides", ["Boletus edulis"]),
    0,
  );
});

test("buildCommonsCandidate requires license url and a taxon match", () => {
  const valid = buildCommonsCandidate({
    id: "commons-1",
    requestedTaxon: "Amanita phalloides",
    imageUrl: "https://upload.wikimedia.org/example.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Amanita_phalloides.jpg",
    title: "File:Amanita phalloides.jpg",
    author: "Example Author",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    caption: "Amanita phalloides",
  });
  assert.ok(valid);
  assert.equal(valid.verified, true);
  assert.equal(valid.matchScore, 3);

  assert.equal(buildCommonsCandidate({
    id: "commons-2",
    requestedTaxon: "Amanita phalloides",
    imageUrl: "https://upload.wikimedia.org/example.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Amanita_sp.jpg",
    title: "File:Amanita sp.jpg",
    author: "Example Author",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    caption: "Amanita species",
  }), null);

  assert.equal(buildCommonsCandidate({
    id: "commons-3",
    requestedTaxon: "Amanita phalloides",
    imageUrl: "https://upload.wikimedia.org/example.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Amanita_phalloides.jpg",
    title: "File:Amanita phalloides.jpg",
    author: "Example Author",
    license: "CC BY-NC 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/",
    caption: "Amanita phalloides",
  }), null);
});
