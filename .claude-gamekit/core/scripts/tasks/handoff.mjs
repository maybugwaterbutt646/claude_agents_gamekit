import path from "node:path";
import {
  HANDOFFS_DIR,
  loadTask,
  nowIso,
  relativeToProjectRoot,
  writeJson
} from "../lib/common.mjs";

const args = process.argv.slice(2);
const summaryIndex = args.indexOf("--summary");
const workIndex = args.indexOf("--work");

const fromAgent = args[0];
const toAgent = args[1];
const summary = summaryIndex >= 0 ? args[summaryIndex + 1] : args.slice(2).join(" ").trim();
const workId = workIndex >= 0 ? args[workIndex + 1] : "manual-main";

if (!fromAgent || !toAgent || !summary) {
  process.stderr.write("Usage: node .claude-gamekit/core/scripts/tasks/handoff.mjs <from-agent> <to-agent> --summary <summary> [--work <work-id>]\n");
  process.exit(1);
}

const task = await loadTask("active");
const stem = `${task.task_id}-${workId}`;
const filePath = path.join(HANDOFFS_DIR, `${stem}.json`);
const record = {
  task_id: task.task_id,
  work_id: workId,
  from: fromAgent,
  to: toAgent,
  summary,
  artifacts: [],
  open_risks: [],
  next_action: `Continue ${task.stage} for ${task.feature_id}.`,
  created_at: nowIso()
};

await writeJson(filePath, record);
process.stdout.write(`${JSON.stringify({ handoff: relativeToProjectRoot(filePath) }, null, 2)}\n`);
