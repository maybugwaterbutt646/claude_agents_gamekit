import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CORE_ROOT = path.resolve(MODULE_DIR, "../..");
const DEFAULT_GAMEKIT_ROOT = path.resolve(DEFAULT_CORE_ROOT, "..");
const DEFAULT_PROJECT_ROOT = path.resolve(DEFAULT_GAMEKIT_ROOT, "..");

export const PROJECT_ROOT = path.resolve(process.env.CLAUDE_PROJECT_DIR || DEFAULT_PROJECT_ROOT);
export const GAMEKIT_ROOT = path.join(PROJECT_ROOT, ".claude-gamekit");
export const CORE_ROOT = path.join(GAMEKIT_ROOT, "core");
export const PROJECT_STATE_ROOT = path.join(GAMEKIT_ROOT, "project");
export const PROJECT_DOCS_DIR = path.join(PROJECT_STATE_ROOT, "docs");
export const PROJECT_ARTIFACTS_DIR = path.join(PROJECT_STATE_ROOT, "artifacts");
export const SCHEMAS_DIR = path.join(CORE_ROOT, "schemas");
export const CORE_TESTS_DIR = path.join(CORE_ROOT, "tests");
export const ENGINE_ROOT = path.join(CORE_ROOT, "engines");
export const TASKS_DIR = path.join(PROJECT_ARTIFACTS_DIR, "tasks");
export const WORK_ITEMS_DIR = path.join(PROJECT_ARTIFACTS_DIR, "work-items");
export const HANDOFFS_DIR = path.join(PROJECT_ARTIFACTS_DIR, "handoffs");
export const ASSETS_DIR = path.join(PROJECT_ARTIFACTS_DIR, "assets");
export const VERIFICATION_DIR = path.join(PROJECT_ARTIFACTS_DIR, "verification");
export const CAPABILITIES_DIR = path.join(PROJECT_ARTIFACTS_DIR, "capabilities");
export const ACTIVE_TASK_POINTER = path.join(TASKS_DIR, "active-task.json");

export async function fileExists(targetPath) {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(targetPath, fallback = undefined) {
  if (!(await fileExists(targetPath))) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing file: ${targetPath}`);
  }

  const raw = await readFile(targetPath, "utf8");
  return JSON.parse(raw);
}

export async function writeJson(targetPath, value) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function nowIso() {
  return new Date().toISOString();
}

export function slugify(text) {
  const base = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  if (base) {
    return base;
  }

  return `slice-${createHash("sha1").update(text).digest("hex").slice(0, 8)}`;
}

export function guessEngineFromText(text) {
  const source = text.toLowerCase();

  if (source.includes("wechat") || source.includes("微信") || source.includes("minigame")) {
    return "wechat-minigame";
  }

  if (source.includes("godot")) {
    return "godot";
  }

  if (source.includes("web") || source.includes("browser") || source.includes("three.js") || source.includes("r3f")) {
    return "web";
  }

  return "unity";
}

export async function loadActivePointer() {
  return readJson(ACTIVE_TASK_POINTER, {
    active_task_id: null,
    updated_at: nowIso(),
    note: "Use /gamekit-intake <goal> to create and activate a task."
  });
}

export function taskPath(taskId) {
  return path.join(TASKS_DIR, `${taskId}.json`);
}

export function workItemPath(workId) {
  return path.join(WORK_ITEMS_DIR, `${workId}.json`);
}

export async function setActiveTask(taskId) {
  const pointer = {
    active_task_id: taskId,
    updated_at: nowIso(),
    note: taskId ? `Active task set to ${taskId}.` : "No active task."
  };
  await writeJson(ACTIVE_TASK_POINTER, pointer);
  return pointer;
}

export async function loadTask(taskRef = "active") {
  let taskId = taskRef;

  if (!taskId || taskId === "active") {
    const pointer = await loadActivePointer();
    taskId = pointer.active_task_id;
  }

  if (!taskId) {
    throw new Error("No active task is set.");
  }

  return readJson(taskPath(taskId));
}

export async function saveTask(task) {
  await writeJson(taskPath(task.task_id), task);
  return task;
}

export async function loadWorkItem(workRef) {
  return readJson(workItemPath(workRef));
}

export async function saveWorkItem(workItem) {
  await writeJson(workItemPath(workItem.work_id), workItem);
  return workItem;
}

export async function listJsonFiles(dirPath) {
  if (!(await fileExists(dirPath))) {
    return [];
  }

  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(dirPath, entry.name))
    .sort();
}

export async function findArtifactsForTask(dirPath, taskId) {
  const results = [];
  for (const filePath of await listJsonFiles(dirPath)) {
    const data = await readJson(filePath);
    if (data.task_id === taskId) {
      results.push({ filePath, data });
    }
  }
  return results;
}

export async function findWorkItemsForTask(taskId) {
  const results = [];
  for (const filePath of await listJsonFiles(WORK_ITEMS_DIR)) {
    const data = await readJson(filePath);
    if (data.task_id === taskId) {
      results.push({ filePath, data });
    }
  }
  return results;
}

export function ensureWithinProject(targetPath) {
  const absolute = path.resolve(PROJECT_ROOT, targetPath);
  const relative = path.relative(PROJECT_ROOT, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes project root: ${targetPath}`);
  }
  return absolute;
}

export function toPortablePath(targetPath) {
  return targetPath.replace(/\\/g, "/");
}

export function relativeToProjectRoot(targetPath) {
  return toPortablePath(path.relative(PROJECT_ROOT, targetPath));
}

export function portableJoin(...segments) {
  return toPortablePath(path.join(...segments));
}

export async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

export function printJson(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

export function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
