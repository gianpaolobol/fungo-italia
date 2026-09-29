import { writeFile, mkdir } from "node:fs/promises";

import {
  scientificReviewPacketSummary,
  scientificReviewPackets,
} from "../lib/scientific-review-packets.ts";

const outputDir = "artifacts/scientific-review";
await mkdir(outputDir, { recursive: true });

const summary = scientificReviewPacketSummary();
await writeFile(
  outputDir + "/packets.json",
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    summary,
    packets: scientificReviewPackets,
  }, null, 2) + "\n",
  "utf8",
);

const sections = scientificReviewPackets.map((packet) => {
  const evidenceLines = packet.evidence.map((evidence) => {
    return "- " + evidence.sourceTitle + " | " + evidence.sourceLocation +
      " | " + evidence.claimSummary +
      (evidence.sourceUrl ? " | " + evidence.sourceUrl : "");
  });
  return [
    "## " + packet.packetId,
    "",
    "Priority: " + packet.priority,
    "Claim type: " + packet.claimType,
    "Review mode: " + packet.reviewMode,
    "Decision: " + packet.decisionRequired,
    "Claims: " + packet.claimIds.length,
    "Subjects: " + packet.subjectIds.length,
    "",
    "Value JSON:",
    packet.claims[0]?.valueJson ?? "{}",
    "",
    "Evidence:",
    ...evidenceLines,
    "",
  ].join("\n");
});

const markdown = [
  "# Scientific review packets",
  "",
  "Generated from the current reviewNeeded catalog claims.",
  "",
  "Summary: " + JSON.stringify(summary),
  "",
  ...sections,
].join("\n");

await writeFile(outputDir + "/packets.md", markdown + "\n", "utf8");
console.log("Scientific review packet export written:", JSON.stringify(summary));
