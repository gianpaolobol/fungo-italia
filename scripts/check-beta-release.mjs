import { evaluateBetaReleaseGate } from "../lib/beta-release-gate.ts";

const enforce = process.argv.includes("--enforce");
const gate = evaluateBetaReleaseGate();

console.log("Beta release readiness:");
console.log(JSON.stringify(gate.checks, null, 2));

if (gate.ready) {
  console.log("READY: all final release gates are satisfied.");
  process.exit(0);
}

console.log("BLOCKED:");
for (const blocker of gate.blockers) {
  console.log(`- ${blocker}`);
}

if (enforce) process.exit(1);
