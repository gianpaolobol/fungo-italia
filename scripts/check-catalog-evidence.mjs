import {
  allCatalogEvidence,
  assertCatalogEvidencePublishable,
  catalogSources,
  nomenclatureEvidence,
  sourcePageIndex,
  trainingEvidence,
  validateCatalogEvidence,
  validateSourcePageIndex,
} from "../lib/catalog-evidence.ts";

const evidence = validateCatalogEvidence();
const pages = validateSourcePageIndex();

if (!evidence.ok || !pages.ok) {
  console.error("Catalog evidence validation failed.");
  for (const error of [...evidence.errors, ...pages.errors]) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const sourceRoles = Object.fromEntries(
  ["training", "edibility", "nomenclature", "ecology", "supplemental"].map((role) => [
    role,
    catalogSources.filter((source) => source.authorityRole === role).length,
  ]),
);

console.log(
  [
    `Catalog evidence: sources=${catalogSources.length}`,
    `trainingEvidence=${trainingEvidence.length}`,
    `nomenclatureEvidence=${nomenclatureEvidence.length}`,
    `allEvidence=${allCatalogEvidence.length}`,
    `sourcePageIndex=${sourcePageIndex.length}`,
    `roles=${JSON.stringify(sourceRoles)}`,
  ].join("; "),
);

// There are no S2 edibility/treatment records in this lot yet; the publishable
// gate must nevertheless be green for all evidence that exists now.
assertCatalogEvidencePublishable();

console.log("Catalog evidence gate: PASS");
