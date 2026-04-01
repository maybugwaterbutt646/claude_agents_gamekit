import test from "node:test";
import assert from "node:assert/strict";
import { validateProject } from "../scripts/validate/template-rules.mjs";

test("template validation has no structural errors", async () => {
  const { errors } = await validateProject();
  assert.deepEqual(errors, []);
});
