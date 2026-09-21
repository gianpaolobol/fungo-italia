import {
  assertMinimumEdibilityExtracted,
  minimumEdibilityAssessments,
  minimumEdibilityEvidence,
} from "../lib/minimum-edibility.ts";

const result = assertMinimumEdibilityExtracted();

console.log(
  [
    `Minimum S2 assessments=${result.assessmentCount}`,
    `evidence=${result.evidenceCount}`,
    `treatmentAssessments=${result.treatmentAssessmentCount}`,
    `approved=${result.approvedCount}`,
    `categories=${JSON.stringify(result.categoryCounts)}`,
  ].join("; "),
);

if (process.argv.includes("--publishable")) {
  console.error(
    "The minimum-edibility extraction lot intentionally stops before scientific approval; " +
    "use the later review lot to promote normalized S2 claims to approved.",
  );
  process.exit(2);
}

if (minimumEdibilityAssessments.length !== 148 || minimumEdibilityEvidence.length < 148) {
  process.exit(1);
}

console.log("Minimum S2 extraction gate: PASS");
