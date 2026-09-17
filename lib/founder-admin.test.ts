import assert from "node:assert/strict";
import test from "node:test";

import { isFounderAdmin } from "./founder-admin.ts";

test("configured curator is founder admin during beta", () => {
  assert.equal(isFounderAdmin("admin@example.it", "ADMIN@example.it, altro@example.it"), true);
  assert.equal(isFounderAdmin("estraneo@example.it", "admin@example.it"), false);
  assert.equal(isFounderAdmin("admin@example.it", null), false);
});
