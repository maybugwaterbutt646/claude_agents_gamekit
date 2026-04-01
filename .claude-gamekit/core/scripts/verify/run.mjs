import path from "node:path";
import { access } from "node:fs/promises";
import {
  CAPABILITIES_DIR,
  PROJECT_DOCS_DIR,
  PROJECT_ROOT,
  VERIFICATION_DIR,
  loadTask,
  nowIso,
  readJson,
  relativeToProjectRoot,
  writeJson
} from "../lib/common.mjs";
import { planUnityVerification } from "./unity.mjs";
import { planGodotVerification } from "./godot.mjs";
import { planWebVerification } from "./web.mjs";
import { planWechatVerification } from "./wechat-minigame.mjs";

function getArg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return fallback;
  }
  return process.argv[index + 1] || fallback;
}

async function markerExists(fileName) {
  try {
    await access(path.join(PROJECT_ROOT, fileName));
    return true;
  } catch {
    return false;
  }
}

function plannerFor(engine) {
  switch (engine) {
    case "unity":
      return planUnityVerification;
    case "godot":
      return planGodotVerification;
    case "web":
      return planWebVerification;
    case "wechat-minigame":
      return planWechatVerification;
    default:
      throw new Error(`Unsupported engine: ${engine}`);
  }
}

async function detectWorkspace(engine) {
  switch (engine) {
    case "unity":
      return (await markerExists("ProjectSettings/ProjectVersion.txt")) || (await markerExists("Assets"));
    case "godot":
      return markerExists("project.godot");
    case "web":
      return (await markerExists("package.json")) && (await markerExists("src"));
    case "wechat-minigame":
      return (await markerExists("game.json")) || (await markerExists("project.config.json"));
    default:
      return false;
  }
}

const taskRef = getArg("--task", "active");
const task = await loadTask(taskRef);
const engine = getArg("--engine", task.engine);
const capability = await readJson(path.join(CAPABILITIES_DIR, `${engine}.json`));
const workspaceFound = await detectWorkspace(engine);
const plan = plannerFor(engine)(capability, workspaceFound);
const artifactPath = path.join(VERIFICATION_DIR, `${task.task_id}-${engine}.json`);

const result = {
  task_id: task.task_id,
  engine,
  result: plan.result,
  checks_run: plan.checks_run,
  blocked_reason: plan.blocked_reason,
  evidence_paths: [
    relativeToProjectRoot(path.join(CAPABILITIES_DIR, `${engine}.json`)),
    relativeToProjectRoot(path.join(PROJECT_DOCS_DIR, "qa", "reports", `${task.task_id}.md`))
  ],
  followups: capability.ci_required,
  generated_at: nowIso()
};

await writeJson(artifactPath, result);
process.stdout.write(`${JSON.stringify({
  artifact: relativeToProjectRoot(artifactPath),
  result: result.result
}, null, 2)}\n`);
