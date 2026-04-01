import path from "node:path";
import {
  HANDOFFS_DIR,
  PROJECT_DOCS_DIR,
  VERIFICATION_DIR,
  findArtifactsForTask,
  loadTask,
  nowIso,
  relativeToProjectRoot,
  saveTask,
  setActiveTask
} from "../lib/common.mjs";
import { access } from "node:fs/promises";

const [, , taskRef = "active"] = process.argv;
const task = await loadTask(taskRef);
const handoffs = await findArtifactsForTask(HANDOFFS_DIR, task.task_id);
const verifications = await findArtifactsForTask(VERIFICATION_DIR, task.task_id);
const reportPath = path.join(PROJECT_DOCS_DIR, "qa", "reports", `${task.task_id}.md`);

let reportExists = true;
try {
  await access(reportPath);
} catch {
  reportExists = false;
}

const missing = [];
if (!handoffs.length) {
  missing.push("at least one HandoffRecord in .claude-gamekit/project/artifacts/handoffs/");
}
if (!verifications.length) {
  missing.push("at least one VerifyResult in .claude-gamekit/project/artifacts/verification/");
}
if (!reportExists) {
  missing.push(`.claude-gamekit/project/docs/qa/reports/${task.task_id}.md`);
}

if (missing.length) {
  process.stderr.write(`Cannot close ${task.task_id}. Missing: ${missing.join(", ")}\n`);
  process.exit(1);
}

task.stage = "closed";
task.status = "done";
task.owner = "main-orchestrator";
task.updated_at = nowIso();
await saveTask(task);
await setActiveTask(null);

process.stdout.write(`${JSON.stringify({
  task_id: task.task_id,
  status: task.status,
  report: relativeToProjectRoot(reportPath)
}, null, 2)}\n`);
