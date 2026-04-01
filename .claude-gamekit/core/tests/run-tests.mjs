import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { PROJECT_ROOT, readJson } from "../scripts/lib/common.mjs";
import { parseFrontmatter } from "../scripts/lib/frontmatter.mjs";
import { COMMAND_NAMES, CUSTOM_AGENTS, validateProject } from "../scripts/validate/template-rules.mjs";
import { runScriptSmoke } from "./script-smoke.mjs";

const failures = [];

async function runCheck(name, fn) {
  try {
    await fn();
    process.stdout.write(`PASS ${name}\n`);
  } catch (error) {
    failures.push({ name, error });
    process.stderr.write(`FAIL ${name}: ${error.message}\n`);
  }
}

await runCheck("template validation", async () => {
  const { errors } = await validateProject();
  assert.deepEqual(errors, []);
});

await runCheck("agent frontmatter and fixtures", async () => {
  const fixtures = await readJson(path.join(PROJECT_ROOT, ".claude-gamekit", "core", "tests", "fixtures", "agent-contracts.json"));

  for (const agentName of CUSTOM_AGENTS) {
    const filePath = path.join(PROJECT_ROOT, ".claude", "agents", `${agentName}.md`);
    const content = await readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(content);

    assert.ok(frontmatter.attributes.description, `${agentName} missing description`);
    assert.ok(frontmatter.attributes.tools, `${agentName} missing tools`);
    assert.ok(Array.isArray(fixtures[agentName]), `${agentName} missing fixtures`);
    assert.ok(fixtures[agentName].length >= 2, `${agentName} needs two fixtures`);
  }
});

await runCheck("command frontmatter", async () => {
  for (const commandName of COMMAND_NAMES) {
    const filePath = path.join(PROJECT_ROOT, ".claude", "commands", `${commandName}.md`);
    const content = await readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(content);

    assert.ok(frontmatter.attributes.description, `${commandName} missing description`);
    assert.ok(frontmatter.attributes["allowed-tools"], `${commandName} missing allowed-tools`);
  }
});

await runCheck("script smoke coverage", runScriptSmoke);

if (failures.length) {
  process.stderr.write(`\n${failures.length} test group(s) failed.\n`);
  process.exit(1);
}

process.stdout.write("All tests passed.\n");
