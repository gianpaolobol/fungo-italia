import assert from "node:assert/strict";
import test from "node:test";

import {
  scientificReviewPacketSummary,
  scientificReviewPackets,
} from "./scientific-review-packets.ts";

test("review packet export preserves the deduplicated 295-batch / 616-claim contract", () => {
  const summary = scientificReviewPacketSummary();

  assert.equal(summary.packets, 295);
  assert.equal(summary.claims, 616);
  assert.equal(summary.critical, 98);
  assert.equal(summary.high, 137);
  assert.equal(summary.normal, 60);
  assert.equal(summary.low, 0);
});

test("every packet carries concrete claims and source-complete evidence", () => {
  for (const packet of scientificReviewPackets) {
    assert.ok(packet.claims.length > 0, packet.packetId);
    assert.ok(packet.evidence.length > 0, packet.packetId);
    assert.deepEqual(
      packet.claims.map((claim) => claim.claimId).sort(),
      [...packet.claimIds].sort(),
      packet.packetId,
    );

    for (const claim of packet.claims) {
      assert.equal(claim.reviewStatus, "reviewNeeded", claim.claimId);
      assert.equal(claim.claimType, packet.claimType, claim.claimId);
      assert.doesNotThrow(() => JSON.parse(claim.valueJson), claim.claimId);
    }

    for (const evidence of packet.evidence) {
      assert.ok(evidence.sourceId.trim(), packet.packetId);
      assert.ok(evidence.sourceTitle.trim(), packet.packetId);
      assert.ok(evidence.sourceLocation.trim(), packet.packetId);
      assert.ok(evidence.claimSummary.trim(), packet.packetId);
    }
  }
});

test("critical packets are exclusively safety-relevant or otherwise explicitly high-risk", () => {
  const critical = scientificReviewPackets.filter(
    (packet) => packet.priority === "critical",
  );
  assert.equal(critical.length, 98);

  for (const packet of critical) {
    assert.ok(
      ["confusion", "edibility", "treatment"].includes(packet.claimType),
      packet.packetId + ": " + packet.claimType,
    );
    assert.equal(
      packet.decisionRequired,
      "approve-or-reject-safety",
      packet.packetId,
    );
  }
});

test("review packets never fabricate a source URL for local/internal evidence", () => {
  const internal = scientificReviewPackets.flatMap((packet) =>
    packet.evidence.filter(
      (evidence) => evidence.sourceId === "EDITORIAL-minimum-card-synthesis-v1",
    )
  );

  assert.ok(internal.length > 0);
  assert.equal(
    internal.every((evidence) => evidence.sourceUrl === null),
    true,
  );
});

test("all packet identifiers are stable and unique", () => {
  const ids = scientificReviewPackets.map((packet) => packet.packetId);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.every((id) => id.startsWith("packet-review-batch-")), true);
});
