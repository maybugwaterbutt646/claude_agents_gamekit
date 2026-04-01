import path from "node:path";
import {
  PROJECT_ARTIFACTS_DIR,
  PROJECT_DOCS_DIR,
  fileExists,
  loadActivePointer,
  loadTask,
  printJson,
  readStdinJson,
  relativeToProjectRoot
} from "../lib/common.mjs";

await readStdinJson();
const pointer = await loadActivePointer();

if (!pointer.active_task_id) {
  printJson({
    decision: "block",
    reason: "Subagent cannot stop cleanly because no active task pointer is set. Restore the active task or finish cleanup explicitly."
  });
  process.exit(0);
}

const task = await loadTask(pointer.active_task_id);
const requiredPaths = [];

if (task.stage === "spec") {
  requiredPaths.push(path.join(PROJECT_DOCS_DIR, "planning", "features", `${task.feature_id}.md`));
}

if (task.stage === "test-design") {
  requiredPaths.push(path.join(PROJECT_DOCS_DIR, "qa", "cases", `${task.feature_id}.md`));
}

if (task.stage === "verification") {
  requiredPaths.push(path.join(PROJECT_DOCS_DIR, "qa", "reports", `${task.task_id}.md`));
  requiredPaths.push(path.join(PROJECT_ARTIFACTS_DIR, "verification", `${task.task_id}-${task.engine}.json`));
}

if (task.stage === "asset-pass") {
  requiredPaths.push(path.join(PROJECT_DOCS_DIR, "art", "asset-catalog.md"));
  requiredPaths.push(path.join(PROJECT_DOCS_DIR, "art", "replacement-guide.md"));
}

for (const filePath of requiredPaths) {
  if (!(await fileExists(filePath))) {
    printJson({
      decision: "block",
      reason: `Before stopping, create or update ${relativeToProjectRoot(filePath)}.`
    });
    process.exit(0);
  }
}
