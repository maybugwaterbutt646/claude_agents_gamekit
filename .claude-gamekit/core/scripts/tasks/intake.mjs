import {
  ACTIVE_TASK_POINTER,
  guessEngineFromText,
  loadTask,
  nowIso,
  portableJoin,
  relativeToProjectRoot,
  saveTask,
  setActiveTask,
  slugify,
  taskPath
} from "../lib/common.mjs";

const goal = process.argv.slice(2).join(" ").trim();
if (!goal) {
  process.stderr.write("Usage: node .claude-gamekit/core/scripts/tasks/intake.mjs <goal>\n");
  process.exit(1);
}

const featureId = slugify(goal);
const taskId = `task-${featureId}`;
const engine = guessEngineFromText(goal);

let task;
try {
  task = await loadTask(taskId);
  task.stage = task.stage || "intake";
  task.owner = "main-orchestrator";
  task.status = "active";
  task.goal = goal;
  task.engine = task.engine || engine;
} catch {
  task = {
    task_id: taskId,
    feature_id: featureId,
    goal,
    engine,
    stage: "intake",
    owner: "main-orchestrator",
    status: "active",
    inputs: [goal],
    expected_outputs: [
      portableJoin(".claude-gamekit", "project", "docs", "planning", "features", `${featureId}.md`),
      portableJoin(".claude-gamekit", "project", "docs", "qa", "cases", `${featureId}.md`),
      portableJoin(".claude-gamekit", "project", "artifacts", "verification", `${taskId}-${engine}.json`)
    ],
    created_at: nowIso(),
    updated_at: nowIso()
  };
}

task.updated_at = nowIso();
await saveTask(task);
await setActiveTask(taskId);

process.stdout.write(`${JSON.stringify({
  task_id: taskId,
  feature_id: featureId,
  engine,
  task_path: relativeToProjectRoot(taskPath(taskId)),
  active_pointer: relativeToProjectRoot(ACTIVE_TASK_POINTER)
}, null, 2)}\n`);
