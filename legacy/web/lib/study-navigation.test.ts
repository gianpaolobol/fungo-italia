import test from "node:test";
import assert from "node:assert/strict";
import { adjacentStudyIds, studyFeedLimit } from "./study-navigation.ts";
test("filtered sequence stays bounded and does not substitute missing selections", () => {
  assert.deepEqual(adjacentStudyIds(["a", "b", "c"], "b"), { index: 1, total: 3, previousId: "a", nextId: "c" });
  assert.equal(adjacentStudyIds(["a", "b"], "a").previousId, null);
  assert.equal(adjacentStudyIds(["a", "b"], "b").nextId, null);
  assert.deepEqual(adjacentStudyIds(["a"], "missing"), { index: -1, total: 1, previousId: null, nextId: null });
  assert.equal(adjacentStudyIds([], null).nextId, null);
});
test("URL feed limit is bounded and rejects untrusted malformed values", () => {
  assert.equal(studyFeedLimit("20", 148), 20);
  assert.equal(studyFeedLimit("999999", 148), 148);
  assert.equal(studyFeedLimit("javascript:alert(1)", 148), 10);
  assert.equal(studyFeedLimit("-5", 148), 10);
  assert.equal(studyFeedLimit("20", 3), 3);
  assert.equal(studyFeedLimit(null, 0), 0);
});
