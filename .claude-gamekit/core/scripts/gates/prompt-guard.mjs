import { loadActivePointer, loadTask, printJson, readStdinJson } from "../lib/common.mjs";

const payload = await readStdinJson();
const prompt = (payload.prompt || "").trim();
const pointer = await loadActivePointer();
const activeTaskId = pointer.active_task_id;

const mutatingPattern = /(implement|write|edit|modify|create|replace|refactor|fix|build|test|verify|asset|scene|prefab|script|代码|修改|实现|测试|验证|资源)/i;
const exemptPattern = /^\/(gamekit-intake|help|gamekit-close)\b/i;

if (!activeTaskId && mutatingPattern.test(prompt) && !exemptPattern.test(prompt)) {
  printJson({
    decision: "block",
    reason: "No active task is set. Start with /gamekit-intake <goal> before requesting implementation, asset work, or verification."
  });
  process.exit(0);
}

if (activeTaskId) {
  const task = await loadTask(activeTaskId);
  printJson({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: `Active task: ${task.task_id} | feature: ${task.feature_id} | engine: ${task.engine} | stage: ${task.stage}`
    }
  });
}
