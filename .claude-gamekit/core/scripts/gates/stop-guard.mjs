import {
  HANDOFFS_DIR,
  VERIFICATION_DIR,
  findArtifactsForTask,
  loadActivePointer,
  loadTask,
  printJson,
  readStdinJson
} from "../lib/common.mjs";

const payload = await readStdinJson();
if (payload.stop_hook_active) {
  process.exit(0);
}

const pointer = await loadActivePointer();
if (!pointer.active_task_id) {
  process.exit(0);
}

const task = await loadTask(pointer.active_task_id);
if (task.stage === "closed" || task.status === "done" || task.status === "blocked") {
  process.exit(0);
}

const handoffs = await findArtifactsForTask(HANDOFFS_DIR, task.task_id);
const verifications = await findArtifactsForTask(VERIFICATION_DIR, task.task_id);

if (["spec", "test-design", "asset-pass", "implementation", "integration", "dispatch"].includes(task.stage) && !handoffs.length) {
  printJson({
    decision: "block",
    reason: `Active task ${task.task_id} is still open. Leave at least one HandoffRecord or mark the task blocked before ending the session.`
  });
  process.exit(0);
}

if (task.stage === "verification" && !verifications.length) {
  printJson({
    decision: "block",
    reason: `Active task ${task.task_id} is in verification. Produce a VerifyResult before ending the session.`
  });
}
