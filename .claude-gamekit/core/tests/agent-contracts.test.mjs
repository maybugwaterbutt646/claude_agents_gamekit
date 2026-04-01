import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { PROJECT_ROOT, readJson } from "../scripts/lib/common.mjs";
import { parseFrontmatter } from "../scripts/lib/frontmatter.mjs";
import { CUSTOM_AGENTS } from "../scripts/validate/template-rules.mjs";

const fixtures = await readJson(path.join(PROJECT_ROOT, ".claude-gamekit", "core", "tests", "fixtures", "agent-contracts.json"));

for (const agentName of CUSTOM_AGENTS) {
  test(`${agentName} has frontmatter and fixture coverage`, async () => {
    const filePath = path.join(PROJECT_ROOT, ".claude", "agents", `${agentName}.md`);
    const content = await readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(content);

    assert.ok(frontmatter.attributes.description);
    assert.ok(frontmatter.attributes.tools);
    assert.ok(Array.isArray(fixtures[agentName]));
    assert.ok(fixtures[agentName].length >= 2);
  });
}
