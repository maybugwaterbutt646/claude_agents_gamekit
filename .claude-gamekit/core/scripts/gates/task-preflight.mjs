import { findWorkItemsForTask, loadActivePointer, loadTask, printJson, readStdinJson } from "../lib/common.mjs";

const payload = await readStdinJson();
const pointer = await loadActivePointer();

if (!pointer.active_task_id) {
  printJson({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Subagents require an active task. Run /gamekit-intake first."
    }
  });
  process.exit(0);
}

const task = await loadTask(pointer.active_task_id);
const workItems = await findWorkItemsForTask(task.task_id);
const promptSource = JSON.stringify(payload.tool_input || payload);
const matchingWorkItems = workItems
  .map(({ data }) => data)
  .filter((item) => promptSource.includes(item.agent));

const scopedContext = matchingWorkItems.length
  ? `Assigned work items: ${matchingWorkItems.map((item) => `${item.work_id} -> ${item.write_scope.join(", ")}`).join(" | ")}`
  : "No specific WorkItemRecord was matched. Stay within your delegated write scope.";

printJson({
  systemMessage: `Active task is ${task.task_id}. Maintain star-topology handoffs, leave a short summary, and update the correct docs or artifacts before stopping. ${scopedContext}`
});
