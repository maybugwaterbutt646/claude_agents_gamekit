import { loadTask, nowIso, saveTask } from "../lib/common.mjs";

const [, , taskRef = "active", stage, owner, status] = process.argv;
if (!stage) {
  process.stderr.write("Usage: node .claude-gamekit/core/scripts/tasks/set-stage.mjs <task-id|active> <stage> [owner] [status]\n");
  process.exit(1);
}

const task = await loadTask(taskRef);
task.stage = stage;
if (owner) {
  task.owner = owner;
}
if (status) {
  task.status = status;
}
task.updated_at = nowIso();

await saveTask(task);
process.stdout.write(`${JSON.stringify(task, null, 2)}\n`);
