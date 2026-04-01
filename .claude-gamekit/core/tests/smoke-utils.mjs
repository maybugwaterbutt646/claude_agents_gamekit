import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { PROJECT_ROOT } from "../scripts/lib/common.mjs";

const TOOLKIT_ENTRIES = ["CLAUDE.md", ".claude", ".claude-gamekit"];

export async function createIsolatedWorkspace() {
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "gamekit-smoke-"));

  for (const entry of TOOLKIT_ENTRIES) {
    await cp(path.join(PROJECT_ROOT, entry), path.join(workspaceRoot, entry), { recursive: true, force: true });
  }

  await mkdir(path.join(workspaceRoot, "Assets"), { recursive: true });
  await writeFile(path.join(workspaceRoot, "Assets", ".gitkeep"), "");

  await mkdir(path.join(workspaceRoot, "ProjectSettings"), { recursive: true });
  await writeFile(path.join(workspaceRoot, "ProjectSettings", "ProjectVersion.txt"), "m_EditorVersion: 2022.3.0f1\n");

  await mkdir(path.join(workspaceRoot, "src"), { recursive: true });
  await writeFile(path.join(workspaceRoot, "src", "index.ts"), "export {};\n");

  await writeFile(path.join(workspaceRoot, "package.json"), "{}\n");
  await writeFile(path.join(workspaceRoot, "project.godot"), "[gd_project]\n");
  await writeFile(path.join(workspaceRoot, "game.json"), "{}\n");

  return workspaceRoot;
}

export async function destroyIsolatedWorkspace(workspaceRoot) {
  await rm(workspaceRoot, { recursive: true, force: true });
}

export function runToolkitScript(scriptRelativePath, { workspaceRoot, args = [], stdin = "" } = {}) {
  const result = spawnSync(
    process.execPath,
    [path.join(PROJECT_ROOT, ".claude-gamekit", "core", "scripts", scriptRelativePath), ...args],
    {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: workspaceRoot,
        FORCE_COLOR: "0"
      },
      input: stdin,
      encoding: "utf8"
    }
  );

  if (result.error) {
    throw result.error;
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

export function parseJsonOutput(output, label) {
  const trimmed = output.trim();
  if (!trimmed) {
    throw new Error(`Expected JSON output from ${label}, but stdout was empty.`);
  }

  return JSON.parse(trimmed);
}
