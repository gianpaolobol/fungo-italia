import assert from "node:assert/strict";
import test from "node:test";
import { isCompatibleCommonsLicense } from "./commons-media.ts";

test("accepts only reusable Commons licenses", () => {
  assert.equal(isCompatibleCommonsLicense("CC BY-SA 4.0"), true);
  assert.equal(isCompatibleCommonsLicense("Public domain"), true);
  assert.equal(isCompatibleCommonsLicense("All rights reserved"), false);
});
