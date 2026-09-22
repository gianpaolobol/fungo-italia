import { execFileSync } from "node:child_process";

import attestations from "../data/catalog/release-attestations.json" with { type: "json" };
import { evaluateBetaReleaseGate } from "../lib/beta-release-gate.ts";

const enforceBeta = process.argv.includes("--enforce");
const enforceScientific = process.argv.includes("--enforce-scientific");
const gate = evaluateBetaReleaseGate();

function smokeFreshnessBlocker() {
  const sha = attestations.visualViewportSmoke.commitSha;
  if (attestations.visualViewportSmoke.status !== "verified" || !sha) return null;

  try {
    const changed = execFileSync(
      "git",
      ["diff", "--name-only", `${sha}..HEAD`],
      { encoding: "utf8" },
    )
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);

    const harmless = changed.filter((path) =>
      path === "data/catalog/release-attestations.json" ||
      path === "scripts/check-beta-release.mjs" ||
      path.startsWith("docs/") ||
      path.startsWith(".github/")
    );
    const runtime = changed.filter((path) => !harmless.includes(path));

    return runtime.length > 0
      ? `Visual smoke is stale; runtime files changed after ${sha}: ${runtime.join(", ")}`
      : null;
  } catch (error) {
    return `Unable to verify visual-smoke freshness: ${error instanceof Error ? error.message : String(error)}`;
  }
}

const freshnessBlocker = smokeFreshnessBlocker();
if (freshnessBlocker) {
  gate.ready = false;
  gate.blockers.push(freshnessBlocker);
  gate.scientificReady = false;
  gate.scientificBlockers.push(freshnessBlocker);
}

console.log("Private beta readiness:");
console.log(JSON.stringify(gate.checks, null, 2));

if (gate.ready) {
  console.log("BETA READY: all private-beta release gates are satisfied.");
} else {
  console.log("BETA BLOCKED:");
  for (const blocker of gate.blockers) console.log(`- ${blocker}`);
}

if (gate.scientificReady) {
  console.log("SCIENTIFIC READY: all independent scientific completion gates are satisfied.");
} else {
  console.log("SCIENTIFIC COMPLETION BLOCKED:");
  for (const blocker of gate.scientificBlockers) console.log(`- ${blocker}`);
}

if (enforceScientific && !gate.scientificReady) process.exit(1);
if (enforceBeta && !gate.ready) process.exit(1);
