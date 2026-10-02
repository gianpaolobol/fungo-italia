import assert from "node:assert/strict";
import test from "node:test";
import { emptyLearningProgress, parseLearningProgress, recordLearningAttempt } from "./learning-progress.ts";
test("invalid, cross-account and future-version progress cannot leak into a session", () => {
  for (const raw of ["invalid", JSON.stringify({version: 1, userId: "other", studied: ["a"]}), JSON.stringify({version: 2, userId: "me", studied: ["a"]})]) assert.deepEqual(parseLearningProgress(raw, "me", ["a"]), emptyLearningProgress("me"));
});
test("unknown records and invalid attempt counts are discarded", () => {
  const parsed = parseLearningProgress(JSON.stringify({version: 1,userId:"me",studied:["a","a","deleted"],review:["deleted","a"],attempts:{a:{correct:2,incorrect:1},deleted:{correct:1,incorrect:0},b:{correct:-1,incorrect:0}}}),"me",["a","b"]);
  assert.deepEqual(parsed.studied,["a"]); assert.deepEqual(parsed.review,["a"]); assert.deepEqual(parsed.attempts,{a:{correct:2,incorrect:1}});
});
test("wrong answers enter review and correct answers clear review without claiming study completion", () => {
  const wrong = recordLearningAttempt(emptyLearningProgress("me"),"a",false);
  const fixed = recordLearningAttempt(wrong,"a",true);
  assert.deepEqual(wrong.review,["a"]); assert.deepEqual(fixed.review,[]);
  assert.deepEqual(fixed.attempts.a,{correct:1,incorrect:1}); assert.deepEqual(fixed.studied,[]);
});
