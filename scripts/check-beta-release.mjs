import { evaluateBetaReleaseGate } from "../lib/beta-release-gate.ts";

const enforceBeta = process.argv.includes("--enforce");
const enforceScientific = process.argv.includes("--enforce-scientific");
const gate = evaluateBetaReleaseGate();

console.log("Private beta readiness:");
console.log(JSON.stringify(gate.checks, null, 2));

if (gate.ready) {
  console.log("BETA READY: all private-beta release gates are satisfied.");
} else {
  console.log("BETA BLOCKED:");
  for (const blocker of gate.blockers) {
    console.log(`- ${blocker}`);
  }
}

if (gate.scientificReady) {
  console.log("SCIENTIFIC READY: all independent scientific completion gates are satisfied.");
} else {
  console.log("SCIENTIFIC COMPLETION BLOCKED:");
  for (const blocker of gate.scientificBlockers) {
    console.log(`- ${blocker}`);
  }
}

if (enforceScientific && !gate.scientificReady) process.exit(1);
if (enforceBeta && !gate.ready) process.exit(1);
