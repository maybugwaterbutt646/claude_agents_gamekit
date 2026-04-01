import path from "node:path";
import { readFile } from "node:fs/promises";
import {
  ASSETS_DIR,
  CAPABILITIES_DIR,
  CORE_ROOT,
  CORE_TESTS_DIR,
  HANDOFFS_DIR,
  PROJECT_ARTIFACTS_DIR,
  PROJECT_DOCS_DIR,
  PROJECT_ROOT,
  SCHEMAS_DIR,
  TASKS_DIR,
  VERIFICATION_DIR,
  WORK_ITEMS_DIR,
  fileExists,
  readJson
} from "../lib/common.mjs";
import { parseFrontmatter } from "../lib/frontmatter.mjs";
import { validateAgainstSchema } from "../lib/schema.mjs";

export const CUSTOM_AGENTS = [
  "gamekit-feature-analyst",
  "gamekit-placeholder-artist",
  "gamekit-tech-art-contracts",
  "gamekit-gameplay-engineer",
  "gamekit-qa-verifier",
  "gamekit-research-scout",
  "gamekit-script-validator",
  "gamekit-release-manager",
  "gamekit-bilingual-docs",
  "gamekit-unity-integrator",
  "gamekit-godot-integrator",
  "gamekit-web-integrator",
  "gamekit-wechat-integrator"
];

export const COMMAND_NAMES = [
  "gamekit-intake",
  "gamekit-slice",
  "gamekit-dispatch",
  "gamekit-asset-pass",
  "gamekit-implement",
  "gamekit-verify",
  "gamekit-close"
];

const REQUIRED_PATHS = [
  "CLAUDE.md",
  ".claude/settings.json",
  ".claude-gamekit/core/README.md",
  ".claude-gamekit/core/package.json",
  ".claude-gamekit/project/docs/shared/workflow-rules.md",
  ".claude-gamekit/project/docs/art/replacement-guide.md",
  ".claude-gamekit/project/docs/engineering/engine-capabilities.md",
  ".claude-gamekit/project/docs/qa/test-strategy.md",
  ".claude-gamekit/core/tests/fixtures/agent-contracts.json",
  ".claude-gamekit/core/tests/fixtures/example-feature-spec.json",
  ".claude-gamekit/core/tests/fixtures/example-test-case.json",
  ".claude-gamekit/core/tests/fixtures/example-task-record.json",
  ".claude-gamekit/core/tests/fixtures/example-work-item-record.json",
  ".claude-gamekit/core/tests/fixtures/example-handoff-record.json",
  ".claude-gamekit/core/tests/fixtures/example-asset-contract.json",
  ".claude-gamekit/core/tests/fixtures/example-verify-result.json",
  ".claude-gamekit/core/tests/fixtures/example-engine-capability.json",
  ".claude-gamekit/core/scripts/tasks/handoff.mjs",
  ".claude-gamekit/core/templates/docs/.gitkeep",
  ".claude-gamekit/core/templates/artifacts/.gitkeep",
  ".claude-gamekit/core/templates/evals/.gitkeep"
];

const SCHEMA_MAP = new Map([
  [path.join(CORE_TESTS_DIR, "fixtures", "example-task-record.json"), "task-record.schema.json"],
  [path.join(CORE_TESTS_DIR, "fixtures", "example-work-item-record.json"), "work-item-record.schema.json"],
  [path.join(CORE_TESTS_DIR, "fixtures", "example-handoff-record.json"), "handoff-record.schema.json"],
  [path.join(CORE_TESTS_DIR, "fixtures", "example-asset-contract.json"), "asset-contract.schema.json"],
  [path.join(CORE_TESTS_DIR, "fixtures", "example-verify-result.json"), "verify-result.schema.json"],
  [path.join(CORE_TESTS_DIR, "fixtures", "example-engine-capability.json"), "engine-capability.schema.json"],
  [path.join(CORE_TESTS_DIR, "fixtures", "example-feature-spec.json"), "feature-spec.schema.json"],
  [path.join(CORE_TESTS_DIR, "fixtures", "example-test-case.json"), "test-case-spec.schema.json"]
]);

export async function validateProject(root = PROJECT_ROOT) {
  const errors = [];

  for (const relativePath of REQUIRED_PATHS) {
    if (!(await fileExists(path.join(root, relativePath)))) {
      errors.push(`Missing required file: ${relativePath}`);
    }
  }

  const settings = await readJson(path.join(root, ".claude", "settings.json"));
  for (const hook of ["UserPromptSubmit", "PreToolUse", "SubagentStop", "Stop"]) {
    if (!settings.hooks?.[hook]?.length) {
      errors.push(`Hook ${hook} is not configured in .claude/settings.json`);
    }
  }

  for (const agentName of CUSTOM_AGENTS) {
    const filePath = path.join(root, ".claude", "agents", `${agentName}.md`);
    if (!(await fileExists(filePath))) {
      errors.push(`Missing agent definition: ${agentName}`);
      continue;
    }

    const content = await readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter.attributes.description) {
      errors.push(`Agent ${agentName} is missing a description frontmatter field.`);
    }
    if (!frontmatter.attributes.tools) {
      errors.push(`Agent ${agentName} is missing a tools frontmatter field.`);
    }
    if ((frontmatter.attributes.tools || "").includes("Task")) {
      errors.push(`Agent ${agentName} should not include the Task tool. Keep star topology at the main session level.`);
    }
  }

  for (const commandName of COMMAND_NAMES) {
    const filePath = path.join(root, ".claude", "commands", `${commandName}.md`);
    if (!(await fileExists(filePath))) {
      errors.push(`Missing command definition: ${commandName}`);
      continue;
    }

    const content = await readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter.attributes.description) {
      errors.push(`Command ${commandName} is missing a description frontmatter field.`);
    }
    if (!frontmatter.attributes["allowed-tools"]) {
      errors.push(`Command ${commandName} is missing an allowed-tools frontmatter field.`);
    }
  }

  const fixtureData = await readJson(path.join(root, ".claude-gamekit", "core", "tests", "fixtures", "agent-contracts.json"));
  for (const agentName of CUSTOM_AGENTS) {
    const cases = fixtureData[agentName];
    if (!Array.isArray(cases) || cases.length < 2) {
      errors.push(`Agent ${agentName} needs at least two contract fixtures.`);
    }
  }

  for (const [artifactPath, schemaName] of SCHEMA_MAP.entries()) {
    const schema = await readJson(path.join(SCHEMAS_DIR, schemaName));
    const artifact = await readJson(artifactPath);
    const schemaErrors = validateAgainstSchema(schema, artifact, path.relative(root, artifactPath).replace(/\\/g, "/"));
    errors.push(...schemaErrors);
  }

  return { errors };
}
